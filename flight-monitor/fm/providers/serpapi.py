"""SerpApi Google Flights provider (stdlib urllib only).

Key comes ONLY from the SERPAPI_API_KEY environment variable. It is never logged,
stored, or left in any URL kept in the output.
"""
import json
import os
import socket
import urllib.error
import urllib.parse
import urllib.request

from ..models import (
    Fare,
    Query,
    STATUS_EMPTY,
    STATUS_NOT_VERIFIED,
    STATUS_OK,
    not_verified,
)
from .base import FareProvider

ENDPOINT = "https://serpapi.com/search.json"
ENV_KEY = "SERPAPI_API_KEY"
TIMEOUT_SECONDS = 45

# SerpApi travel_class codes: 1 Economy, 2 Premium economy, 3 Business, 4 First.
TRAVEL_CLASS = {"economy": 1, "business": 3, "first": 4}
CLASS_LABEL = {"economy": "economy", "business": "business", "first": "first"}

# Patched in tests so no test ever touches the network.
_urlopen = urllib.request.urlopen


def strip_secret(url, key=None):
    """Remove api_key from a URL (and the key value from any string)."""
    if not url:
        return url
    parts = urllib.parse.urlsplit(url)
    query = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query) if k.lower() != "api_key"]
    cleaned = urllib.parse.urlunsplit(
        (parts.scheme, parts.netloc, parts.path, urllib.parse.urlencode(query), parts.fragment)
    )
    if key:
        cleaned = cleaned.replace(key, "")
    return cleaned


def _airport_id(node):
    if isinstance(node, dict):
        value = node.get("id") or node.get("name")
        return str(value) if value else None
    return None


def _airport_time(node):
    if isinstance(node, dict):
        value = node.get("time")
        return str(value) if value else None
    return None


def _parse_segments(legs):
    """Capture per-leg segments from Google Flights legs, when present.

    Additive: returns [] when the legs carry no airport/time detail. Reads only
    what the API returned (local times); never fabricates missing fields.
    """
    segments = []
    for leg in legs:
        if not isinstance(leg, dict):
            continue
        dep = leg.get("departure_airport")
        arr = leg.get("arrival_airport")
        frm = _airport_id(dep)
        to = _airport_id(arr)
        dep_local = _airport_time(dep)
        arr_local = _airport_time(arr)
        duration = leg.get("duration")
        duration_min = int(duration) if isinstance(duration, (int, float)) and not isinstance(duration, bool) else None
        if frm is None and to is None and dep_local is None and arr_local is None and duration_min is None:
            continue
        segments.append({
            "from": frm,
            "to": to,
            "dep_local": dep_local,
            "arr_local": arr_local,
            "duration_min": duration_min,
        })
    return segments


class SerpApiProvider(FareProvider):
    name = "SerpApi Google Flights"
    url = "https://serpapi.com/google-flights-api"

    def __init__(self, api_key=None):
        self._key = api_key if api_key is not None else os.environ.get(ENV_KEY, "")

    @property
    def has_credentials(self):
        return bool(self._key)

    def build_params(self, q: Query):
        params = {
            "engine": "google_flights",
            "currency": "USD",
            "hl": "en",
            "gl": "us",
            "adults": q.adults,
            "travel_class": TRAVEL_CLASS[q.cabin],
            "api_key": self._key,
        }
        if q.open_jaw:
            legs = [
                {"departure_id": q.origin, "arrival_id": q.arrive, "date": q.outbound_date},
                {"departure_id": q.depart, "arrival_id": q.origin, "date": q.return_date},
            ]
            params.update({"type": 3, "multi_city_json": json.dumps(legs, separators=(",", ":"))})
        else:
            params.update(
                {
                    "type": 1,
                    "departure_id": q.origin,
                    "arrival_id": q.arrive,
                    "outbound_date": q.outbound_date,
                    "return_date": q.return_date,
                }
            )
        return params

    def search(self, query: Query) -> Fare:
        cabin = query.cabin
        if not self._key:
            return not_verified(cabin, "no API key")
        if cabin not in TRAVEL_CLASS:
            return not_verified(cabin, "unsupported cabin")
        url = ENDPOINT + "?" + urllib.parse.urlencode(self.build_params(query))
        try:
            with _urlopen(url, timeout=TIMEOUT_SECONDS) as resp:
                body = resp.read()
            data = json.loads(body.decode("utf-8"))
        except urllib.error.HTTPError as exc:
            return not_verified(cabin, "HTTP %s from provider" % exc.code)
        except (urllib.error.URLError, socket.timeout, TimeoutError, OSError):
            return not_verified(cabin, "network error or timeout")
        except (ValueError, UnicodeDecodeError):
            return not_verified(cabin, "unreadable provider response")
        return self.parse(data, query)

    def parse(self, data, query: Query) -> Fare:
        cabin = query.cabin
        if not isinstance(data, dict):
            return not_verified(cabin, "unexpected provider response")
        itineraries = []
        for key in ("best_flights", "other_flights"):
            value = data.get(key)
            if isinstance(value, list):
                itineraries.extend(i for i in value if isinstance(i, dict))
        if not itineraries:
            err = str(data.get("error", "")).lower()
            if "any results" in err:
                # The API answered and positively said there is nothing for this query.
                return Fare(status=STATUS_EMPTY, cabin=cabin, reason="no results returned")
            if err:
                return not_verified(cabin, "provider error")
            return not_verified(cabin, "empty provider response")

        wanted = CLASS_LABEL[cabin]
        best = None
        for it in itineraries:
            legs = it.get("flights")
            price = it.get("price")
            if not isinstance(legs, list) or not legs:
                continue
            if isinstance(price, bool) or not isinstance(price, (int, float)) or price <= 0:
                continue
            classes = {str(l.get("travel_class", "")).strip().lower() for l in legs if isinstance(l, dict)}
            if classes != {wanted}:
                continue  # never accept a different or mixed cabin
            if best is None or price < best["price"]:
                best = it
        if best is None:
            return not_verified(cabin, "no result matched the requested cabin")

        legs = best["flights"]
        airlines = []
        for leg in legs:
            name = leg.get("airline")
            if name and name not in airlines:
                airlines.append(name)
        layovers = [
            str(l.get("id") or l.get("name"))
            for l in (best.get("layovers") or [])
            if isinstance(l, dict) and (l.get("id") or l.get("name"))
        ]
        segments = _parse_segments(legs)
        duration = best.get("total_duration")
        link = strip_secret((data.get("search_metadata") or {}).get("google_flights_url"), self._key)
        if not (isinstance(link, str) and link.startswith("https://")):
            link = None
        return Fare(
            status=STATUS_OK,
            cabin=cabin,
            airline=", ".join(airlines) or None,
            stops=max(len(legs) - 1, 0),
            duration_min=int(duration) if isinstance(duration, (int, float)) else None,
            layovers=layovers,
            price_usd=float(best["price"]),
            booking_url=link,
            segments=segments,
        )

"""Mock provider for tests and --mock. Reads a fixture; never touches the network.

Fixture shape:
{"fares": {"STL|DAD|SGN|economy|2027-11-20": {"status": "ok", "price_usd": 1000, ...}}}
The date part may be "*". Unlisted queries return not_verified.
"""
import json

from ..models import Fare, Query, not_verified
from .base import FareProvider


class MockProvider(FareProvider):
    name = "Sample fixture (not real prices)"
    url = ""

    def __init__(self, fares=None, path=None):
        if path is not None:
            with open(path, "r", encoding="utf-8") as fh:
                fares = json.load(fh).get("fares", {})
        self.fares = fares or {}
        self.calls = []

    @property
    def has_credentials(self):
        return True

    def search(self, query: Query) -> Fare:
        self.calls.append(query)
        base = "|".join([query.origin, query.arrive, query.depart, query.cabin])
        entry = self.fares.get(base + "|" + query.outbound_date) or self.fares.get(base + "|*")
        if entry is None:
            return not_verified(query.cabin, "no fixture for this query")
        return Fare(
            status=entry.get("status", "not_verified"),
            cabin=entry.get("cabin", query.cabin),
            airline=entry.get("airline"),
            stops=entry.get("stops"),
            duration_min=entry.get("duration_min"),
            layovers=list(entry.get("layovers", [])),
            price_usd=entry.get("price_usd"),
            booking_url=entry.get("booking_url"),
            reason=entry.get("reason"),
            segments=list(entry.get("segments", [])),
        )

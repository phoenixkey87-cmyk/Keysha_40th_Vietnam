"""Orchestrates one refresh: query, classify, store history, build rows."""
import re
from datetime import date, datetime, timedelta

from . import analysis, arrival, snapshot
from .models import Fare, Query, STATUS_OK, not_verified

CABIN_ORDER = {"economy": 0, "business": 1, "first": 2}

# Landing in Vietnam on 2027-11-21 is the fixed invariant (OD2, Decided). Each
# itinerary's config `outbound_date` is DERIVED from the Part 1 STL-departure
# recommendation (Nov 19 vs Nov 20) and is PROVISIONAL / user-supplied until real
# Part 1 schedule data exists; config currently carries one provisional value
# (2027-11-19). The arrival_requirement.candidate_departures drive the Part 1
# candidate-departure economy queries that verify the Nov-21 landing per candidate.


def _shift_date(iso, days):
    return (date.fromisoformat(iso) + timedelta(days=days)).isoformat()


def _slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


class Budgeted:
    """Counts provider calls and stops at max_calls."""

    def __init__(self, provider, max_calls):
        self.provider = provider
        self.max_calls = int(max_calls)
        self.calls = 0

    def search(self, query):
        if self.calls >= self.max_calls:
            return not_verified(query.cabin, "call budget reached")
        self.calls += 1
        return self.provider.search(query)


def route_label(origin, arrive, depart):
    if arrive == depart:
        return "%s \u21c4 %s" % (origin, arrive)
    return "%s \u2192 %s / %s \u2192 %s" % (origin, arrive, depart, origin)


def _candidate_departures(it):
    """Candidate STL departure dates for this itinerary, newest config shape first."""
    req = it.get("arrival_requirement") or {}
    cands = req.get("candidate_departures") or []
    return [c for c in cands if isinstance(c, str)]


def plan(cfg):
    """Return the list of base (non-shift) queries per itinerary: (itin_id, kind, name, Query).

    Includes one economy "candidate" query per arrival_requirement candidate
    departure date per itinerary (Part 1 arrival-day verification). These are
    counted in the dry-run projection and the live quota estimate.
    """
    out = []
    home = cfg["home_airport"]
    cabins = cfg["cabins_by_kind"]
    for itin_id, it in cfg["itineraries"].items():
        def q(origin, cabin, itin=it, iid=itin_id, outbound=None):
            return Query(
                iid, origin, itin["arrive"], itin["depart"],
                outbound or itin["outbound_date"], itin["return_date"], cabin,
            )

        for cabin in sorted(cabins["primary"], key=CABIN_ORDER.get):
            out.append((itin_id, "primary", None, q(home, cabin)))
        for origin in cfg.get("alternate_origins", []):
            for cabin in sorted(cabins["alternate"], key=CABIN_ORDER.get):
                out.append((itin_id, "alternate", None, q(origin, cabin)))
        for t in cfg.get("travelers", []):
            for cabin in sorted(cabins["traveler"], key=CABIN_ORDER.get):
                out.append((itin_id, "traveler", t["name"], q(t["home_airport"], cabin)))
        for dep in _candidate_departures(it):
            out.append((itin_id, "candidate", dep, q(home, "economy", outbound=dep)))
    return out


MIXED_LABEL = "Business long-haul + Economy elsewhere, not a single-ticket quote"


def _longhaul_leg(segments, rule):
    """Identify the long-haul leg from returned segments per the configured rule.

    Only "longest_oceanic_segment" is supported today: pick the segment with the
    greatest duration_min. Returns the segment dict or None ("not identified")
    when segments are absent or carry no durations.
    """
    if not segments:
        return None
    best = None
    for seg in segments:
        if not isinstance(seg, dict):
            continue
        dur = seg.get("duration_min")
        if not isinstance(dur, (int, float)) or isinstance(dur, bool):
            continue
        if best is None or dur > best.get("duration_min", -1):
            best = seg
    return best


def _mixed_cabin_row(itin_id, home, mixed_cfg, prim, travelers, checked_iso,
                     history, now, low_window, th):
    """Compose the per-person mixed_cabin row from the economy + business primaries.

    ZERO new provider calls: reads the already-finalized primary fares in `prim`.
    `ok` only when BOTH components are `ok`; otherwise `not_verified`. Never invents
    a price: every number comes from a real `ok` component fare.
    """
    if not mixed_cfg.get("enabled"):
        return None

    components = dict(mixed_cfg.get("components") or {})
    longhaul_cabin = components.get("longhaul", "business")
    other_cabin = components.get("other", "economy")

    row_key = "%s|%s|mixed_cabin|mixed_cabin" % (itin_id, home)
    econ_fare = prim.get(other_cabin)
    biz_fare = prim.get(longhaul_cabin)

    row = {
        "id": row_key,
        "route": "%s \u21c4 mixed cabin" % home,
        "origin": home,
        "kind": "mixed_cabin",
        "traveler_name": None,
        "cabin": "mixed_cabin",
        "components": {"longhaul": longhaul_cabin, "other": other_cabin},
        "mixed_is_approximation": True,
        "mixed_label": MIXED_LABEL,
        "pricing_unit": "per_person",
        "travelers": travelers,
        "longhaul_leg": None,
        "all_economy_total": None,
        "all_business_total": None,
        "upgrade_delta_usd": None,
        "group_total": None,
        "checked_at": checked_iso,
        "low_30d": None,
        "change": None,
        "drop_flag": False,
        "shift": None,
        "alt_flag": False,
    }

    both_ok = (
        econ_fare is not None and econ_fare.status == STATUS_OK and econ_fare.price_usd is not None
        and biz_fare is not None and biz_fare.status == STATUS_OK and biz_fare.price_usd is not None
    )
    if not both_ok:
        row["status"] = "not_verified"
        row["reason"] = "mixed-cabin approximation needs both economy and business fares verified"
        return row

    econ_total = float(econ_fare.price_usd)
    biz_total = float(biz_fare.price_usd)
    # Labelled approximation: the business whole-itinerary total anchors the
    # long-haul business price; the economy total and the upgrade delta are shown
    # alongside so the figure is never mistaken for a single-ticket quote.
    per_person = round(biz_total, 2)

    leg = _longhaul_leg(biz_fare.segments or econ_fare.segments, mixed_cfg.get("longhaul_rule"))
    row["longhaul_leg"] = leg  # None -> "not identified" in the UI
    row["all_economy_total"] = round(econ_total, 2)
    row["all_business_total"] = round(biz_total, 2)
    row["upgrade_delta_usd"] = round(biz_total - econ_total, 2)
    row["status"] = STATUS_OK
    row["reason"] = None
    row["price_usd"] = per_person

    if isinstance(travelers, int) and not isinstance(travelers, bool) and travelers >= 1:
        row["group_total"] = round(per_person * travelers, 2)
    else:
        row["group_total"] = None  # unknown traveler count -> UI shows "not verified"

    if checked_iso is not None:
        fare = Fare(
            status=STATUS_OK, cabin="mixed_cabin", price_usd=per_person,
            airline=biz_fare.airline, checked_at=checked_iso,
        )
        prev = history.previous_ok_price(row_key)
        hist = history.ok_prices_since(row_key, now - timedelta(days=low_window))
        history.insert(itin_id, row_key, "mixed_cabin", 0, fare, now)
        row["low_30d"] = analysis.low_30d(hist, now, low_window)
        row["change"] = analysis.change(per_person, prev)
        row["drop_flag"] = analysis.is_drop(per_person, prev, th["drop_pct"])

    return row


def run_checks(cfg, provider, history, now, live, max_calls=None):
    """Run every check and return (itineraries dict for the snapshot, calls_made).

    live=False means no credentials: no provider call, no history write, every row
    "not verified" with checked_at null.
    """
    th = cfg["thresholds"]
    budget = Budgeted(provider, max_calls if max_calls is not None else cfg["max_calls_per_run"])
    now_iso = _iso(now)
    interval = timedelta(days=cfg["shift_check_interval_days"])
    low_window = int(th["low_window_days"])
    offsets = [-int(th["shift_days"]), int(th["shift_days"])]
    result = {}

    home_airport = cfg["home_airport"]
    mixed_cfg = cfg.get("mixed_cabin") or {}
    for itin_id, it in cfg["itineraries"].items():
        rows = []
        econ = {}  # (origin, offset) -> finalized economy Fare
        by_origin_cabin = {}  # (origin, cabin) -> row, for alternate comparison

        prim = {}  # cabin -> finalized primary Fare at STL (for mixed_cabin composition)

        def do_check(q, row_key, kind, offset, store_econ=True):
            """Return (fare, checked_iso_or_None)."""
            if not live:
                return not_verified(q.cabin, "no API key"), None
            raw = budget.search(q)
            raw = analysis.resolve_cabin({raw.cabin: raw}, q.cabin)  # reject any cabin mismatch
            fare = analysis.finalize_fare(raw, econ.get((q.origin, offset)))
            if q.cabin == "economy" and store_econ:
                econ[(q.origin, offset)] = fare
            fare.checked_at = now_iso
            history.insert(itin_id, row_key, kind, offset, fare, now)
            return fare, now_iso

        for (iid, kind, name, base_q) in [p for p in plan(cfg) if p[0] == itin_id]:
            if kind == "traveler":
                slug = "traveler:" + _slug(name)
            elif kind == "candidate":
                # One economy row per candidate departure date; keep them distinct.
                slug = "candidate:" + base_q.outbound_date
            else:
                slug = kind
            row_key = "%s|%s|%s|%s" % (itin_id, base_q.origin, slug, base_q.cabin)
            prev = history.previous_ok_price(row_key) if live else None
            # Candidate economy rows must not clobber the primary economy fare used
            # for alternate comparison and shift logic.
            fare, checked = do_check(base_q, row_key, kind, 0, store_econ=(kind != "candidate"))
            cur = fare.price_usd if fare.status == STATUS_OK else None
            hist = history.ok_prices_since(row_key, now - timedelta(days=low_window)) if live else []
            row = {
                "id": row_key,
                "route": route_label(base_q.origin, base_q.arrive, base_q.depart),
                "origin": base_q.origin,
                "kind": kind,
                "traveler_name": name,
                "cabin": base_q.cabin,
                "status": fare.status,
                "reason": fare.reason,
                "airline": fare.airline,
                "stops": fare.stops,
                "duration_min": fare.duration_min,
                "layovers": fare.layovers,
                "booking_url": fare.booking_url if fare.status == STATUS_OK else None,
                "checked_at": checked,
                "low_30d": analysis.low_30d(hist, now, low_window) if cur is not None else None,
                "change": analysis.change(cur, prev),
                "drop_flag": analysis.is_drop(cur, prev, th["drop_pct"]),
                "shift": None,
                "alt_flag": False,
            }
            if cur is not None:
                row["price_usd"] = cur

            # Capture per-leg segments and derive arrival-day / connection flags from
            # returned data only. Candidate and primary rows carry the timing view;
            # rows stay "not verified" for timing when segments are absent.
            if kind in ("candidate", "primary"):
                segs = list(fare.segments or [])
                row["segments"] = segs
                arr = arrival.arrival_day(base_q.outbound_date, segs)
                conn = arrival.connection_flags(segs)
                row["arrival"] = arr
                row["short_connection"] = conn["has_short"]

            # Remember the STL primary fare per cabin for the mixed_cabin composition.
            if kind == "primary" and base_q.origin == home_airport:
                prim[base_q.cabin] = fare

            by_origin_cabin[(base_q.origin, kind, base_q.cabin, name)] = row

            # +/- N day shifts, only for primary rows of cabins listed under "shift".
            if kind == "primary" and base_q.cabin in cfg["cabins_by_kind"]["shift"] and live and cur is not None:
                options = []
                for off in offsets:
                    skey = "%s|shift%+d" % (row_key, off)
                    last = history.latest(skey)
                    due = last is None or now - last["checked_dt"] >= interval
                    sq = Query(
                        itin_id, base_q.origin, base_q.arrive, base_q.depart,
                        _shift_date(base_q.outbound_date, off), _shift_date(base_q.return_date, off), base_q.cabin,
                    )
                    if due:
                        sfare, _ = do_check(sq, skey, "shift", off)
                        price, when = (sfare.price_usd if sfare.status == STATUS_OK else None), now_iso
                    else:
                        price = last["price_usd"] if last["status"] == STATUS_OK else None
                        when = last["checked_at"]
                    options.append({
                        "offset_days": off,
                        "dates": [sq.outbound_date, sq.return_date],
                        "price_usd": price,
                        "checked_at": when,
                    })
                best = analysis.best_shift(cur, options, th["shift_usd"])
                if best:
                    row["shift"] = {
                        "offset_days": best["offset_days"],
                        "dates": best["dates"],
                        "price_usd": best["price_usd"],
                        "saving_usd": best["saving_usd"],
                    }
            rows.append(row)

        # Alternate origins are shown only when >= alt_origin_usd cheaper than STL, same cabin.
        home = home_airport
        kept = []
        for row in rows:
            if row["kind"] != "alternate":
                kept.append(row)
                continue
            stl_row = by_origin_cabin.get((home, "primary", row["cabin"], None))
            stl_price = stl_row.get("price_usd") if stl_row else None
            alt_price = row.get("price_usd")
            if analysis.alt_origin_flag(stl_price, alt_price, th["alt_origin_usd"]):
                row["alt_flag"] = True
                row["alt_saving_usd"] = round(stl_price - alt_price, 2)
                row["stl_price_usd"] = stl_price
                kept.append(row)

        # Compose the per-person mixed-cabin row from the economy + business
        # primaries already queried (ZERO new provider calls).
        mixed = _mixed_cabin_row(
            itin_id, home, mixed_cfg, prim, it.get("travelers"), now_iso if live else None,
            history, now, low_window, th,
        )
        if mixed is not None:
            kept.append(mixed)

        result[itin_id] = {
            "label": it.get("label", itin_id),
            "arrive": it["arrive"],
            "depart": it["depart"],
            "origin": home,
            "travelers": it.get("travelers"),
            "outbound_date": it["outbound_date"],
            "return_date": it["return_date"],
            "rows": kept,
        }
    return result, budget.calls


def build_snapshot(cfg, provider, history, now, mode):
    live = mode in ("live", "sample")
    itins, calls = run_checks(cfg, provider, history, now, live)
    snap = snapshot.build(
        mode,
        _iso(now),
        {"name": provider.name, "url": provider.url},
        cfg["thresholds"],
        itins,
    )
    return snap, calls

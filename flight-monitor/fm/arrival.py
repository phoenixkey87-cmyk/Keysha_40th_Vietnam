"""Pure arrival-day and connection logic. No I/O, no clocks, no network.

Reads only data the provider already returned (per-leg segments). Never invents
a date or a time: when segments are absent the arrival day is "not verified".
"""
from datetime import datetime

LAND_BY_DEFAULT = "2027-11-21"


def _local_date(value):
    """Return the YYYY-MM-DD date part of a local date/datetime string, or None.

    Accepts "2027-11-21", "2027-11-21 13:40", "2027-11-21T13:40" and similar; only
    the leading date is used (segment times are local, no timezone math applied).
    """
    if not isinstance(value, str):
        return None
    text = value.strip()
    if not text:
        return None
    head = text.replace("T", " ").split(" ", 1)[0]
    try:
        datetime.strptime(head, "%Y-%m-%d")
    except ValueError:
        return None
    return head


def arrival_day(outbound_date_iso, segments, land_by=LAND_BY_DEFAULT):
    """Derive the local arrival date from the FINAL segment.

    Returns {date, verified, slips, reason}.
    - no segments -> {date:None, verified:False, slips:False, reason:'schedule not published'}
    - arrival date after land_by -> slips True
    """
    if not segments:
        return {"date": None, "verified": False, "slips": False, "reason": "schedule not published"}
    final = segments[-1]
    arr = _local_date(final.get("arr_local") if isinstance(final, dict) else None)
    if arr is None:
        return {"date": None, "verified": False, "slips": False, "reason": "arrival time not published"}
    return {"date": arr, "verified": True, "slips": arr > land_by, "reason": None}


def connection_flags(segments, min_connection_min=120):
    """Flag layovers shorter than min_connection_min from returned data only.

    A connection is the gap between one segment's arrival and the next segment's
    departure. Uses each segment's duration_min and local times when present;
    segments missing timing are skipped (never guessed).
    Returns {short_connections:[idx...], has_short:bool} where idx is the index of
    the arriving segment before the short connection.
    """
    short = []
    if not segments:
        return {"short_connections": [], "has_short": False}
    for i in range(len(segments) - 1):
        gap = _connection_minutes(segments[i], segments[i + 1])
        if gap is not None and gap < min_connection_min:
            short.append(i)
    return {"short_connections": short, "has_short": bool(short)}


def _parse_local(value):
    if not isinstance(value, str):
        return None
    text = value.strip().replace("T", " ")
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None


def _connection_minutes(arriving, departing):
    if not isinstance(arriving, dict) or not isinstance(departing, dict):
        return None
    arr = _parse_local(arriving.get("arr_local"))
    dep = _parse_local(departing.get("dep_local"))
    if arr is None or dep is None:
        return None
    delta = (dep - arr).total_seconds() / 60.0
    if delta < 0:
        return None
    return delta

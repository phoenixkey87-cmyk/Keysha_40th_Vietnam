"""Pure decision logic for the Flight Monitor. No I/O, no clocks, no network."""
from datetime import datetime, timedelta
from typing import Dict, Iterable, List, Optional, Tuple

from .models import (
    Fare,
    STATUS_EMPTY,
    STATUS_NOT_OFFERED,
    STATUS_NOT_VERIFIED,
    STATUS_OK,
)


def _cents(x: float) -> float:
    return round(float(x), 2)


def change(current: Optional[float], previous: Optional[float]) -> Optional[dict]:
    """Change since the previous ok check. None when either price is missing."""
    if current is None or previous is None:
        return None
    diff = _cents(current) - _cents(previous)
    diff = _cents(diff)
    if diff > 0:
        direction = "up"
    elif diff < 0:
        direction = "down"
    else:
        direction = "flat"
    return {"usd": abs(diff), "direction": direction}


def low_30d(
    history: Iterable[Tuple[datetime, float]], now: datetime, window_days: int = 30
) -> Optional[float]:
    """Lowest ok price in the trailing window, including `now`. None if empty."""
    start = now - timedelta(days=window_days)
    prices = [p for (ts, p) in history if p is not None and start <= ts <= now]
    return min(prices) if prices else None


def is_drop(current: Optional[float], previous: Optional[float], pct: float = 10.0) -> bool:
    """True only when the price fell by MORE than pct percent vs the previous ok check."""
    if current is None or previous is None or previous <= 0:
        return False
    return (_cents(previous) - _cents(current)) * 100.0 > pct * _cents(previous)


def best_shift(base: Optional[float], options: List[dict], min_saving: float = 200.0) -> Optional[dict]:
    """Best shifted-date option saving at least min_saving per person vs base.

    options: [{"offset_days", "price_usd", "dates"}]; entries without a price are ignored.
    Returns the option plus "saving_usd", or None when nothing qualifies.
    """
    if base is None:
        return None
    best = None
    for opt in options:
        price = opt.get("price_usd")
        if price is None:
            continue
        saving = _cents(_cents(base) - _cents(price))
        if saving >= min_saving and (best is None or saving > best["saving_usd"]):
            best = dict(opt, saving_usd=saving)
    return best


def alt_origin_flag(stl: Optional[float], alt: Optional[float], threshold: float = 300.0) -> bool:
    """Alternate origin is flagged only when it is >= threshold cheaper than STL."""
    if stl is None or alt is None:
        return False
    return _cents(_cents(stl) - _cents(alt)) >= threshold


def resolve_cabin(fares_by_cabin: Dict[str, Fare], cabin: str) -> Fare:
    """Return the fare for exactly this cabin. NEVER substitutes another cabin."""
    fare = fares_by_cabin.get(cabin)
    if fare is None:
        return Fare(status=STATUS_NOT_VERIFIED, cabin=cabin, reason="no result for this cabin")
    if fare.cabin != cabin:
        return Fare(status=STATUS_NOT_VERIFIED, cabin=cabin, reason="cabin mismatch in result")
    return fare


def finalize_fare(fare: Fare, economy: Optional[Fare]) -> Fare:
    """Turn a provider result into a stored status.

    "Not offered" only when the API positively reported no results for a premium
    cabin AND the economy query on the same route returned fares. Everything
    else that is not ok is "not verified".
    """
    if fare.status == STATUS_OK:
        if fare.price_usd is None:
            return Fare(status=STATUS_NOT_VERIFIED, cabin=fare.cabin, reason="fare had no price")
        return fare
    if fare.status == STATUS_EMPTY:
        if fare.cabin != "economy" and economy is not None and economy.status == STATUS_OK:
            return Fare(
                status=STATUS_NOT_OFFERED,
                cabin=fare.cabin,
                reason="API reported no %s fares on this route" % fare.cabin,
            )
        return Fare(
            status=STATUS_NOT_VERIFIED,
            cabin=fare.cabin,
            reason=fare.reason or "no fares found",
        )
    if fare.status == STATUS_NOT_OFFERED:
        # Only finalize_fare may mint this status; refuse it from providers.
        return Fare(status=STATUS_NOT_VERIFIED, cabin=fare.cabin, reason="unconfirmed availability")
    return fare

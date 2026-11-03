"""Plain data models. No I/O."""
from dataclasses import dataclass, field
from typing import List, Optional

CABINS = ("economy", "business", "first")

# Fare statuses stored and shown. "empty" is internal to providers: the API
# answered successfully but explicitly returned no results for the query.
STATUS_OK = "ok"
STATUS_NOT_OFFERED = "not_offered"
STATUS_NOT_VERIFIED = "not_verified"
STATUS_EMPTY = "empty"


@dataclass(frozen=True)
class Query:
    itinerary_id: str
    origin: str
    arrive: str
    depart: str
    outbound_date: str
    return_date: str
    cabin: str
    adults: int = 1

    @property
    def open_jaw(self) -> bool:
        return self.arrive != self.depart


@dataclass
class Fare:
    status: str
    cabin: str
    airline: Optional[str] = None
    stops: Optional[int] = None
    duration_min: Optional[int] = None
    layovers: List[str] = field(default_factory=list)
    price_usd: Optional[float] = None
    booking_url: Optional[str] = None
    checked_at: Optional[str] = None
    reason: Optional[str] = None
    segments: List[dict] = field(default_factory=list)


def not_verified(cabin: str, reason: str) -> Fare:
    return Fare(status=STATUS_NOT_VERIFIED, cabin=cabin, reason=reason)

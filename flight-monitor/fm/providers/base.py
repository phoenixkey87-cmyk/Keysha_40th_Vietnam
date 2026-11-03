"""Adapter interface every fare provider implements."""
from abc import ABC, abstractmethod

from ..models import Fare, Query


class ProviderError(Exception):
    """Raised for unrecoverable provider setup problems (not per-query failures)."""


class FareProvider(ABC):
    #: Human readable name shown in the UI as the data source.
    name = "unknown"
    #: Link to the provider shown in the UI.
    url = ""

    @property
    @abstractmethod
    def has_credentials(self) -> bool:
        """False when the key is missing; the runner then makes no calls."""

    @abstractmethod
    def search(self, query: Query) -> Fare:
        """Return the lowest total round-trip fare per person for query.cabin.

        Must NEVER raise for per-query failures and must NEVER invent a price.
        Return Fare(status="ok", ...) for a real fare, Fare(status="empty") when the
        API successfully and explicitly reports no results, otherwise
        Fare(status="not_verified", reason=...).
        """

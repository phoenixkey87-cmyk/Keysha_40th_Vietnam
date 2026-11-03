import unittest
from datetime import datetime, timedelta

from fm import analysis
from fm.history import History
from fm.models import Fare

NOW = datetime(2026, 11, 2, 6, 0, 0)


def fare(price):
    return Fare(status="ok", cabin="economy", price_usd=price, airline="X", stops=1, duration_min=10, layovers=["ICN"])


class HistoryTests(unittest.TestCase):
    def setUp(self):
        self.h = History(":memory:")

    def tearDown(self):
        self.h.close()

    def test_previous_ok_price_and_change(self):
        self.h.insert("o", "k", "primary", 0, fare(1000), NOW - timedelta(days=2))
        self.h.insert("o", "k", "primary", 0, Fare(status="not_verified", cabin="economy"), NOW - timedelta(days=1))
        prev = self.h.previous_ok_price("k")
        self.assertEqual(prev, 1000)  # a failed check does not become the baseline
        self.assertEqual(analysis.change(1200, prev), {"usd": 200.0, "direction": "up"})

    def test_30_day_window(self):
        self.h.insert("o", "k", "primary", 0, fare(500), NOW - timedelta(days=31))
        self.h.insert("o", "k", "primary", 0, fare(900), NOW - timedelta(days=10))
        self.h.insert("o", "k", "primary", 0, fare(1000), NOW)
        hist = self.h.ok_prices_since("k", NOW - timedelta(days=30))
        self.assertEqual(analysis.low_30d(hist, NOW), 900)

    def test_latest_roundtrips_layovers(self):
        self.h.insert("o", "k", "primary", 0, fare(1000), NOW)
        self.assertEqual(self.h.latest("k")["layovers"], ["ICN"])
        self.assertIsNone(self.h.latest("missing"))


if __name__ == "__main__":
    unittest.main()

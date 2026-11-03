import unittest
from datetime import datetime, timedelta

from fm import analysis
from fm.models import Fare


class ChangeTests(unittest.TestCase):
    def test_up_down_flat(self):
        self.assertEqual(analysis.change(1100, 1000), {"usd": 100.0, "direction": "up"})
        self.assertEqual(analysis.change(900, 1000), {"usd": 100.0, "direction": "down"})
        self.assertEqual(analysis.change(1000, 1000), {"usd": 0.0, "direction": "flat"})

    def test_missing_gives_none(self):
        self.assertIsNone(analysis.change(None, 1000))
        self.assertIsNone(analysis.change(1000, None))


class Low30Tests(unittest.TestCase):
    now = datetime(2026, 11, 2, 6, 0)

    def test_min_within_window(self):
        hist = [(self.now - timedelta(days=5), 900), (self.now, 1000), (self.now - timedelta(days=29), 950)]
        self.assertEqual(analysis.low_30d(hist, self.now), 900)

    def test_day_31_excluded_and_day_30_included(self):
        hist = [(self.now - timedelta(days=31), 100), (self.now - timedelta(days=30), 500), (self.now, 1000)]
        self.assertEqual(analysis.low_30d(hist, self.now), 500)
        self.assertEqual(analysis.low_30d([(self.now - timedelta(days=31), 100)], self.now), None)

    def test_empty(self):
        self.assertIsNone(analysis.low_30d([], self.now))


class DropTests(unittest.TestCase):
    def test_exactly_ten_percent_is_not_a_drop(self):
        self.assertFalse(analysis.is_drop(900, 1000))

    def test_just_over_ten_percent_is_a_drop(self):
        self.assertTrue(analysis.is_drop(899.9, 1000))

    def test_increase_or_missing_is_not_a_drop(self):
        self.assertFalse(analysis.is_drop(1200, 1000))
        self.assertFalse(analysis.is_drop(None, 1000))
        self.assertFalse(analysis.is_drop(800, None))
        self.assertFalse(analysis.is_drop(800, 0))


class ShiftTests(unittest.TestCase):
    def opts(self, a, b):
        return [
            {"offset_days": -3, "price_usd": a, "dates": ["2027-11-17", "2027-11-26"]},
            {"offset_days": 3, "price_usd": b, "dates": ["2027-11-23", "2027-12-02"]},
        ]

    def test_exactly_200_flags(self):
        best = analysis.best_shift(1200, self.opts(1000, 1500))
        self.assertEqual(best["saving_usd"], 200)
        self.assertEqual(best["offset_days"], -3)

    def test_199_99_does_not_flag(self):
        self.assertIsNone(analysis.best_shift(1200, self.opts(1000.01, None)))

    def test_picks_largest_saving(self):
        best = analysis.best_shift(1200, self.opts(950, 800))
        self.assertEqual(best["offset_days"], 3)
        self.assertEqual(best["saving_usd"], 400)

    def test_missing_base_or_prices(self):
        self.assertIsNone(analysis.best_shift(None, self.opts(1, 1)))
        self.assertIsNone(analysis.best_shift(1200, self.opts(None, None)))


class AltOriginTests(unittest.TestCase):
    def test_exactly_300_flags(self):
        self.assertTrue(analysis.alt_origin_flag(1500, 1200))

    def test_299_99_does_not(self):
        self.assertFalse(analysis.alt_origin_flag(1500, 1200.01))

    def test_missing_or_pricier(self):
        self.assertFalse(analysis.alt_origin_flag(None, 100))
        self.assertFalse(analysis.alt_origin_flag(1500, None))
        self.assertFalse(analysis.alt_origin_flag(1000, 1500))


class CabinTests(unittest.TestCase):
    def test_first_never_substituted_by_business(self):
        only_business = {"business": Fare(status="ok", cabin="business", price_usd=5000)}
        got = analysis.resolve_cabin(only_business, "first")
        self.assertEqual(got.status, "not_verified")
        self.assertIsNone(got.price_usd)

    def test_mislabelled_cabin_is_rejected(self):
        wrong = {"first": Fare(status="ok", cabin="business", price_usd=5000)}
        got = analysis.resolve_cabin(wrong, "first")
        self.assertEqual(got.status, "not_verified")
        self.assertIsNone(got.price_usd)

    def test_exact_cabin_returned(self):
        fares = {"first": Fare(status="ok", cabin="first", price_usd=9000)}
        self.assertEqual(analysis.resolve_cabin(fares, "first").price_usd, 9000)

    def test_not_offered_needs_positive_empty_and_economy_ok(self):
        econ_ok = Fare(status="ok", cabin="economy", price_usd=1000)
        empty_first = Fare(status="empty", cabin="first")
        self.assertEqual(analysis.finalize_fare(empty_first, econ_ok).status, "not_offered")

    def test_empty_without_economy_is_not_verified(self):
        empty_first = Fare(status="empty", cabin="first")
        self.assertEqual(analysis.finalize_fare(empty_first, None).status, "not_verified")
        econ_bad = Fare(status="not_verified", cabin="economy")
        self.assertEqual(analysis.finalize_fare(empty_first, econ_bad).status, "not_verified")

    def test_failure_is_not_verified_never_not_offered(self):
        econ_ok = Fare(status="ok", cabin="economy", price_usd=1000)
        failed = Fare(status="not_verified", cabin="first", reason="HTTP 500")
        self.assertEqual(analysis.finalize_fare(failed, econ_ok).status, "not_verified")

    def test_provider_cannot_mint_not_offered(self):
        econ_ok = Fare(status="ok", cabin="economy", price_usd=1000)
        sneaky = Fare(status="not_offered", cabin="first")
        self.assertEqual(analysis.finalize_fare(sneaky, econ_ok).status, "not_verified")

    def test_ok_without_price_is_not_verified(self):
        self.assertEqual(analysis.finalize_fare(Fare(status="ok", cabin="economy"), None).status, "not_verified")


if __name__ == "__main__":
    unittest.main()

import copy
import os
import tempfile
import unittest
from datetime import datetime
from unittest import mock

import run_monitor
from fm import config as config_mod
from fm import quota
from fm.history import History

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(os.path.dirname(HERE), "config.json")
KEY = "SECRETKEY123"
NOW = datetime(2026, 11, 2, 6, 0, 0)


def cfg():
    return config_mod.load(CONFIG)


class SearchesThisRunTests(unittest.TestCase):
    def test_counts_sixteen_base_searches(self):
        # 12 primary/alternate + 4 candidate-departure economy searches = 16 base.
        c = cfg()
        c["travelers"] = []
        self.assertEqual(len(c["itineraries"]), 2)
        # No shift history on a fresh config count; base is the plan length.
        from fm import runner
        self.assertEqual(len(runner.plan(c)), 16)
        # searches_this_run adds the scheduled shifts (economy primary x 2 offsets x 2 itineraries = 4).
        self.assertEqual(quota.searches_this_run(c), 16 + 4)


class GuardTests(unittest.TestCase):
    def test_allows_when_projected_under_cap(self):
        h = History(":memory:")
        self.addCleanup(h.close)
        verdict = quota.check(cfg(), h, NOW)
        self.assertTrue(verdict["allowed"])
        self.assertLessEqual(verdict["projected"], 100)

    def test_weekly_fixture_under_cap(self):
        # Weekly: ~4.3 runs/month. With 0 month-to-date, one run is well under 100.
        h = History(":memory:")
        self.addCleanup(h.close)
        verdict = quota.check(cfg(), h, NOW)
        self.assertTrue(verdict["allowed"])

    def test_refuses_when_projected_over_cap(self):
        # Simulate a daily-style accumulation already near the cap.
        h = History(":memory:")
        self.addCleanup(h.close)
        verdict = quota.check(cfg(), h, NOW, cap=15)  # this_run (20) > 15
        self.assertFalse(verdict["allowed"])
        self.assertGreater(verdict["projected"], 15)

    def test_month_to_date_pushes_over_cap(self):
        from fm.models import Fare, STATUS_OK
        h = History(":memory:")
        self.addCleanup(h.close)
        fare = Fare(status=STATUS_OK, cabin="economy", price_usd=100.0)
        for i in range(90):
            h.insert("option2", "rk%d" % i, "primary", 0, fare, NOW)
        verdict = quota.check(cfg(), h, NOW)
        self.assertFalse(verdict["allowed"])  # 90 + 20 = 110 > 100

    def test_refusal_reason_has_no_key_or_url(self):
        h = History(":memory:")
        self.addCleanup(h.close)
        verdict = quota.check(cfg(), h, NOW, cap=5)
        self.assertFalse(verdict["allowed"])
        self.assertNotIn(KEY, verdict["reason"])
        self.assertNotIn("api_key", verdict["reason"])
        self.assertNotIn("http", verdict["reason"].lower())


class DryRunTests(unittest.TestCase):
    def test_dry_run_makes_zero_calls_and_writes_nothing(self):
        with tempfile.TemporaryDirectory() as d:
            with mock.patch("fm.providers.serpapi._urlopen") as m:
                self.assertEqual(run_monitor.main(["--dry-run", "--output-dir", d]), 0)
            m.assert_not_called()
            self.assertEqual(os.listdir(d), [])


if __name__ == "__main__":
    unittest.main()

import copy
import json
import os
import re
import tempfile
import unittest
from datetime import datetime
from unittest import mock

import run_monitor
from fm import config as config_mod
from fm import runner
from fm.history import History
from fm.providers.mock import MockProvider

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURE = os.path.join(HERE, "fixtures", "mock_sample.json")
CONFIG = os.path.join(os.path.dirname(HERE), "config.json")
NOW = datetime(2026, 11, 2, 6, 0, 0)


def cfg():
    return config_mod.load(CONFIG)


def all_rows(snap, itin):
    return snap["itineraries"][itin]["rows"]


class NoKeyTests(unittest.TestCase):
    def test_no_key_everything_not_verified_and_no_calls(self):
        provider = MockProvider(fares={})
        h = History(":memory:")
        snap, calls = runner.build_snapshot(cfg(), provider, h, NOW, "no_api_key")
        h.close()
        self.assertEqual(calls, 0)
        self.assertEqual(provider.calls, [])
        self.assertEqual(snap["mode"], "no_api_key")
        for itin in snap["itineraries"].values():
            # economy/business/first primaries + economy candidate rows + the mixed_cabin row.
            self.assertEqual({r["cabin"] for r in itin["rows"]},
                             {"economy", "business", "first", "mixed_cabin"})
            for r in itin["rows"]:
                self.assertEqual(r["status"], "not_verified")
                self.assertNotIn("price_usd", r)
                self.assertIsNone(r.get("checked_at"))


class MockRunTests(unittest.TestCase):
    def run_it(self, config=None):
        c = config or cfg()
        provider = MockProvider(path=FIXTURE)
        h = History(":memory:")
        self.addCleanup(h.close)
        snap, calls = runner.build_snapshot(c, provider, h, NOW, "sample")
        return snap, calls, h

    def test_flags_end_to_end(self):
        snap, calls, _ = self.run_it()
        self.assertEqual(snap["mode"], "sample")
        self.assertIn("SAMPLE", snap["sample_notice"])
        rows = {(r["origin"], r["kind"], r["cabin"]): r for r in all_rows(snap, "option2")}
        econ = rows[("STL", "primary", "economy")]
        self.assertEqual(econ["price_usd"], 2000)
        self.assertEqual(econ["shift"]["offset_days"], -3)  # 1750 saves $250
        self.assertEqual(econ["shift"]["saving_usd"], 250)
        self.assertEqual(econ["low_30d"], 2000)
        self.assertIsNone(econ["change"])  # first check
        # ORD is $400 cheaper -> flagged; MCI is only $200 cheaper -> hidden; ATL has no fare -> hidden.
        alts = {r["origin"]: r for r in all_rows(snap, "option2") if r["kind"] == "alternate"}
        self.assertEqual(list(alts), ["ORD"])
        self.assertTrue(alts["ORD"]["alt_flag"])
        self.assertEqual(alts["ORD"]["alt_saving_usd"], 400)
        # First empty while economy ok -> Not offered; Business never fills in.
        first = rows[("STL", "primary", "first")]
        self.assertEqual(first["status"], "not_offered")
        self.assertNotIn("price_usd", first)

    def test_first_never_gets_business_fare_even_if_fixture_is_wrong(self):
        snap, _, _ = self.run_it()
        # The HAN fixture mislabels a business fare as the "first" result; the runner must reject it.
        rows = {(r["cabin"]): r for r in all_rows(snap, "original")}
        self.assertEqual(rows["business"]["status"], "not_offered")
        self.assertEqual(rows["first"]["status"], "not_verified")
        self.assertNotIn("price_usd", rows["first"])

    def test_second_run_computes_change_and_drop(self):
        c = cfg()
        provider = MockProvider(path=FIXTURE)
        h = History(":memory:")
        self.addCleanup(h.close)
        runner.build_snapshot(c, provider, h, NOW, "sample")
        provider.fares["STL|DAD|SGN|economy|*"] = dict(provider.fares["STL|DAD|SGN|economy|*"], price_usd=1700)
        later = datetime(2026, 11, 3, 6, 0, 0)
        snap, _ = runner.build_snapshot(c, provider, h, later, "sample")
        econ = [r for r in all_rows(snap, "option2") if r["kind"] == "primary" and r["cabin"] == "economy"][0]
        self.assertEqual(econ["change"], {"usd": 300.0, "direction": "down"})
        self.assertTrue(econ["drop_flag"])  # 15% down
        self.assertEqual(econ["low_30d"], 1700)

    def test_budget_cap_stops_calls(self):
        c = cfg()
        c["max_calls_per_run"] = 2
        snap, calls, _ = self.run_it(c)
        self.assertEqual(calls, 2)
        reasons = [r["reason"] for r in all_rows(snap, "original")]
        self.assertIn("call budget reached", reasons)

    def test_configured_traveler_row(self):
        c = cfg()
        c["travelers"] = [{"name": "Test Person", "home_airport": "MCI"}]
        snap, _, _ = self.run_it(c)
        t = [r for r in all_rows(snap, "option2") if r["kind"] == "traveler"]
        self.assertEqual(len(t), 1)
        self.assertEqual(t[0]["traveler_name"], "Test Person")
        self.assertEqual(t[0]["origin"], "MCI")


class CandidateAndMixedTests(unittest.TestCase):
    def run_it(self, config=None):
        c = config or cfg()
        provider = MockProvider(path=FIXTURE)
        h = History(":memory:")
        self.addCleanup(h.close)
        snap, calls = runner.build_snapshot(c, provider, h, NOW, "sample")
        return snap, calls, provider

    def test_four_candidate_departure_economy_searches_added(self):
        c = cfg()
        candidate_plan = [p for p in runner.plan(c) if p[1] == "candidate"]
        # 2 candidate dates x 2 itineraries = 4 extra economy searches.
        self.assertEqual(len(candidate_plan), 4)
        self.assertTrue(all(p[3].cabin == "economy" for p in candidate_plan))

    def test_candidate_rows_present_per_itinerary(self):
        snap, _, _ = self.run_it()
        for itin in ("option2", "original"):
            cand_rows = [r for r in all_rows(snap, itin) if r["kind"] == "candidate"]
            self.assertEqual(len(cand_rows), 2)
            for r in cand_rows:
                self.assertIn("arrival", r)
                self.assertIn("short_connection", r)

    def test_mixed_row_adds_zero_provider_calls(self):
        # Baseline: mixed_cabin disabled -> no mixed row, some call count N.
        c_off = cfg()
        c_off["mixed_cabin"]["enabled"] = False
        p_off = MockProvider(path=FIXTURE)
        h_off = History(":memory:")
        self.addCleanup(h_off.close)
        snap_off, _ = runner.build_snapshot(c_off, p_off, h_off, NOW, "sample")
        self.assertEqual([], [r for it in snap_off["itineraries"].values()
                              for r in it["rows"] if r["kind"] == "mixed_cabin"])

        # Enabled -> mixed row present, EXACTLY the same number of provider calls.
        c_on = cfg()
        p_on = MockProvider(path=FIXTURE)
        h_on = History(":memory:")
        self.addCleanup(h_on.close)
        snap_on, _ = runner.build_snapshot(c_on, p_on, h_on, NOW, "sample")
        self.assertEqual(len(p_on.calls), len(p_off.calls))
        for itin in ("option2", "original"):
            mixed = [r for r in all_rows(snap_on, itin) if r["kind"] == "mixed_cabin"]
            self.assertEqual(len(mixed), 1)

    def test_mixed_ok_only_when_both_components_ok(self):
        snap, _, _ = self.run_it()
        # option2: economy 2000 ok + business 5000 ok -> ok.
        m2 = [r for r in all_rows(snap, "option2") if r["kind"] == "mixed_cabin"][0]
        self.assertEqual(m2["status"], "ok")
        self.assertEqual(m2["all_economy_total"], 2000)
        self.assertEqual(m2["all_business_total"], 5000)
        self.assertEqual(m2["upgrade_delta_usd"], 3000)
        self.assertTrue(m2["mixed_is_approximation"])
        self.assertEqual(m2["pricing_unit"], "per_person")
        # original: business is empty -> mixed not_verified.
        m1 = [r for r in all_rows(snap, "original") if r["kind"] == "mixed_cabin"][0]
        self.assertEqual(m1["status"], "not_verified")
        self.assertNotIn("price_usd", m1)

    def test_group_total_only_with_integer_traveler_count(self):
        # Placeholder -> group_total null.
        snap, _, _ = self.run_it()
        m2 = [r for r in all_rows(snap, "option2") if r["kind"] == "mixed_cabin"][0]
        self.assertIsNone(m2["group_total"])
        # Integer traveler count -> group_total = per_person x count.
        c = cfg()
        c["itineraries"]["option2"]["travelers"] = 3
        snap2, _, _ = self.run_it(c)
        m = [r for r in all_rows(snap2, "option2") if r["kind"] == "mixed_cabin"][0]
        self.assertEqual(m["group_total"], round(m["price_usd"] * 3, 2))

    def test_mixed_change_and_drop_on_second_run(self):
        c = cfg()
        provider = MockProvider(path=FIXTURE)
        h = History(":memory:")
        self.addCleanup(h.close)
        runner.build_snapshot(c, provider, h, NOW, "sample")
        # Lower the business fare so the mixed per-person total drops.
        provider.fares["STL|DAD|SGN|business|*"] = dict(
            provider.fares["STL|DAD|SGN|business|*"], price_usd=4000)
        later = datetime(2026, 11, 3, 6, 0, 0)
        snap, _ = runner.build_snapshot(c, provider, h, later, "sample")
        m = [r for r in all_rows(snap, "option2") if r["kind"] == "mixed_cabin"][0]
        self.assertEqual(m["change"], {"usd": 1000.0, "direction": "down"})
        self.assertTrue(m["drop_flag"])


class ConfigTests(unittest.TestCase):
    def test_shipped_config_is_valid_with_no_invented_travelers(self):
        c = cfg()
        self.assertEqual(c["travelers"], [])
        self.assertEqual(c["itineraries"]["option2"]["travelers"], "[TRAVELER COUNT]")
        self.assertEqual(c["itineraries"]["original"]["travelers"], "[TRAVELER COUNT]")
        self.assertEqual(c["schedule"]["frequency"], "weekly")
        self.assertEqual(c["mixed_cabin"]["pricing_unit"], "per_person")

    def test_validation_errors(self):
        base = cfg()
        for mutate, text in [
            (lambda c: c.update(home_airport="stl"), "home_airport"),
            (lambda c: c["thresholds"].update(shift_usd=-1), "shift_usd"),
            (lambda c: c["schedule"].update(time="25:00"), "schedule.time"),
            (lambda c: c.update(travelers=[{"name": "", "home_airport": "MCI"}]), "name"),
            (lambda c: c.update(travelers=[{"name": "A", "home_airport": "KANSAS"}]), "home_airport"),
            (lambda c: c["itineraries"]["option2"].update(return_date="2027-11-01"), "return_date"),
            (lambda c: c["itineraries"]["option2"].update(travelers=0), "travelers"),
            (lambda c: c["itineraries"]["option2"].update(travelers=-2), "travelers"),
            (lambda c: c["itineraries"]["option2"].update(travelers=2.5), "travelers"),
            (lambda c: c["mixed_cabin"].update(pricing_unit="per_group"), "pricing_unit"),
            (lambda c: c["mixed_cabin"].update(enabled="yes"), "mixed_cabin.enabled"),
            (lambda c: c["mixed_cabin"]["components"].update(longhaul="premium"), "components.longhaul"),
            (lambda c: c["schedule"].update(frequency="hourly"), "schedule.frequency"),
            (lambda c: c["schedule"].update(frequency="every_n_days", every_n_days=0), "every_n_days"),
            (lambda c: c["itineraries"]["option2"]["arrival_requirement"].update(candidate_departures=["2027-11-22"]), "before land_by"),
        ]:
            c = copy.deepcopy(base)
            mutate(c)
            with self.assertRaises(config_mod.ConfigError) as ctx:
                config_mod.validate(c)
            self.assertIn(text, str(ctx.exception))


class OutputTests(unittest.TestCase):
    def test_cli_no_key_writes_valid_files(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("SERPAPI_API_KEY", None)
            with mock.patch.object(run_monitor, "load_env_file"):
                self.assertEqual(run_monitor.main(["--output-dir", d]), 0)
            with open(os.path.join(d, "latest.json"), encoding="utf-8") as fh:
                snap = json.load(fh)
            self.assertEqual(snap["mode"], "no_api_key")
            with open(os.path.join(d, "latest.js"), encoding="utf-8") as fh:
                js = fh.read()
            m = re.fullmatch(r"window\.FLIGHT_MONITOR_DATA = (.*);\n", js, re.S)
            self.assertIsNotNone(m)
            self.assertEqual(json.loads(m.group(1)), snap)

    def test_cli_dry_run_writes_nothing(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertEqual(run_monitor.main(["--dry-run", "--output-dir", d]), 0)
            self.assertEqual(os.listdir(d), [])

    def test_cli_mock_goes_to_given_dir_and_is_labelled(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertEqual(run_monitor.main(["--mock", FIXTURE, "--output-dir", d]), 0)
            with open(os.path.join(d, "latest.json"), encoding="utf-8") as fh:
                self.assertEqual(json.load(fh)["mode"], "sample")

    def test_bad_config_exit_code(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "bad.json")
            with open(p, "w") as fh:
                fh.write("{}")
            self.assertEqual(run_monitor.main(["--config", p]), 2)


if __name__ == "__main__":
    unittest.main()

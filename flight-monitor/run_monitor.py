#!/usr/bin/env python3
"""Daily Flight Monitor refresh.

  python flight-monitor/run_monitor.py                 # live run (needs SERPAPI_API_KEY)
  python flight-monitor/run_monitor.py --dry-run       # print planned queries, no calls, no writes
  python flight-monitor/run_monitor.py --mock FIXTURE  # sample data from a test fixture -> data/sample/

Without a key the run still succeeds: every row is written as "not verified".
"""
import argparse
import os
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from fm import config as config_mod  # noqa: E402
from fm import quota, runner, snapshot  # noqa: E402
from fm.history import History  # noqa: E402
from fm.providers.mock import MockProvider  # noqa: E402
from fm.providers.serpapi import SerpApiProvider  # noqa: E402


def load_env_file(path):
    """Tiny .env reader. Never overrides variables already set in the environment."""
    if not os.path.isfile(path):
        return
    with open(path, "r", encoding="utf-8-sig") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key, value = key.strip(), value.strip().strip('"').strip("'")
            if key and value and key not in os.environ:
                os.environ[key] = value


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config", default=os.path.join(HERE, "config.json"))
    ap.add_argument("--dry-run", action="store_true", help="print planned queries; no API calls, no files written")
    ap.add_argument("--mock", metavar="FIXTURE", help="use a fixture file (SAMPLE data, written to data/sample/)")
    ap.add_argument("--output-dir", help="where latest.json/latest.js (and history) go")
    args = ap.parse_args(argv)

    load_env_file(os.path.join(REPO, ".env"))
    try:
        cfg = config_mod.load(args.config)
    except (config_mod.ConfigError, OSError) as exc:
        print("Config error: %s" % exc, file=sys.stderr)
        return 2

    if args.dry_run:
        queries = runner.plan(cfg)
        this_run = quota.searches_this_run(cfg)
        print("Dry run: %d base queries (+ up to %d shifted-date queries per shifted primary row); max_calls_per_run=%d"
              % (len(queries), 2, cfg["max_calls_per_run"]))
        for itin_id, kind, name, q in queries:
            who = " (%s)" % name if name else ""
            print("  %-9s %-9s %s%s %s -> %s / %s -> %s  %s..%s" % (
                itin_id, kind, q.cabin, who, q.origin, q.arrive, q.depart, q.origin, q.outbound_date, q.return_date))
        print("Quota projection: %d searches this run (cap %d/month); the quota guard enforces the cap on live runs."
              % (this_run, quota.CAP))
        print("No calls made, nothing written.")
        return 0

    if args.mock:
        provider = MockProvider(path=args.mock)
        mode = "sample"
        out_dir = args.output_dir or os.path.join(HERE, "data", "sample")
    else:
        provider = SerpApiProvider()
        mode = "live" if provider.has_credentials else "no_api_key"
        out_dir = args.output_dir or os.path.join(HERE, "data")

    os.makedirs(out_dir, exist_ok=True)
    history = History(os.path.join(out_dir, "history.sqlite"))
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    try:
        # Quota guard: refuse a LIVE run that would push this calendar month over
        # the cap. Mock and no-key runs make no live searches, so they skip it.
        if mode == "live":
            verdict = quota.check(cfg, history, now, usage_cache_path=os.path.join(out_dir, "usage.json"))
            if not verdict["allowed"]:
                print(verdict["reason"], file=sys.stderr)
                return 3
            print(verdict["reason"])
        snap, calls = runner.build_snapshot(cfg, provider, history, now, mode)
    finally:
        history.close()
    json_path, js_path = snapshot.write(snap, out_dir)

    rows = [r for it in snap["itineraries"].values() for r in it["rows"]]
    ok = sum(1 for r in rows if r["status"] == "ok")
    print("mode=%s calls=%d rows=%d ok=%d not_verified=%d not_offered=%d" % (
        mode, calls, len(rows), ok,
        sum(1 for r in rows if r["status"] == "not_verified"),
        sum(1 for r in rows if r["status"] == "not_offered")))
    if mode == "no_api_key":
        print("No SERPAPI_API_KEY found: all rows written as 'not verified'. See .env.example.")
    print("wrote %s and %s" % (json_path, js_path))
    return 0


if __name__ == "__main__":
    sys.exit(main())

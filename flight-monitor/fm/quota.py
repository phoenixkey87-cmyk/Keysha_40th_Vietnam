"""Live-run quota guard. Pure except for reading month-to-date usage.

Refuses to start a live run that would push the current calendar month over the
SerpApi free-plan cap (CAP=100 searches/month). The refusal reason NEVER contains
the API key or any key-bearing URL - it reports only counts.
"""
import json
import os

from . import runner

CAP = 100


def searches_this_run(cfg):
    """Count the searches a live run would make this cycle.

    Base queries from runner.plan() (16: 12 primary/alternate + 4 candidate
    departures) plus the scheduled shifted-date queries. Shifts fire for each
    primary row whose cabin is in cabins_by_kind["shift"], up to 2 offsets each.
    The guard counts them conservatively (every shift due this run).
    """
    base = len(runner.plan(cfg))
    shift_cabins = set(cfg.get("cabins_by_kind", {}).get("shift", []))
    primary_cabins = set(cfg.get("cabins_by_kind", {}).get("primary", []))
    shifted = len(primary_cabins & shift_cabins) * 2 * len(cfg.get("itineraries", {}))
    return base + shifted


def month_to_date(history, now):
    """Count live fares recorded in the current calendar month from the history store.

    The history store is the source of truth (every live fare is recorded). An
    optional data/usage.json cache may pre-seed the count but the store wins.
    """
    prefix = now.strftime("%Y-%m")
    try:
        row = history.db.execute(
            "SELECT COUNT(*) AS n FROM checks WHERE substr(checked_at,1,7)=?", (prefix,)
        ).fetchone()
        return int(row["n"]) if row else 0
    except Exception:
        return 0


def read_usage_cache(path, now):
    """Optional month-to-date cache from data/usage.json ({'YYYY-MM': count}). 0 when absent."""
    if not path or not os.path.isfile(path):
        return 0
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        value = data.get(now.strftime("%Y-%m"), 0)
        return int(value) if isinstance(value, (int, float)) and not isinstance(value, bool) else 0
    except (OSError, ValueError):
        return 0


def check(cfg, history, now, cap=CAP, usage_cache_path=None):
    """Evaluate the guard. Returns {allowed, this_run, month_to_date, projected, cap, reason}.

    The reason string contains only integer counts - never a key or any URL.
    """
    this_run = searches_this_run(cfg)
    mtd = month_to_date(history, now)
    if usage_cache_path:
        mtd = max(mtd, read_usage_cache(usage_cache_path, now))
    projected = mtd + this_run
    allowed = projected <= cap
    if allowed:
        reason = (
            "quota ok: %d searches this run + %d month-to-date = %d projected (cap %d)"
            % (this_run, mtd, projected, cap)
        )
    else:
        reason = (
            "quota guard: this run would reach %d searches this calendar month "
            "(%d month-to-date + %d this run); free cap is %d - reduce scope or wait until next month"
            % (projected, mtd, this_run, cap)
        )
    return {
        "allowed": allowed,
        "this_run": this_run,
        "month_to_date": mtd,
        "projected": projected,
        "cap": cap,
        "reason": reason,
    }

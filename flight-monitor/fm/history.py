"""SQLite history of every check (stdlib sqlite3)."""
import json
import sqlite3
from datetime import datetime

SCHEMA = """
CREATE TABLE IF NOT EXISTS checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itinerary_id TEXT NOT NULL,
  row_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  shift_days INTEGER NOT NULL DEFAULT 0,
  cabin TEXT NOT NULL,
  status TEXT NOT NULL,
  price_usd REAL,
  airline TEXT,
  stops INTEGER,
  duration_min INTEGER,
  layovers TEXT,
  booking_url TEXT,
  checked_at TEXT NOT NULL,
  reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_checks_row ON checks(row_key, checked_at);
"""


def _iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ")


class History:
    def __init__(self, path=":memory:"):
        self.db = sqlite3.connect(path)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)

    def close(self):
        self.db.close()

    def insert(self, itinerary_id, row_key, kind, shift_days, fare, checked_at: datetime):
        self.db.execute(
            "INSERT INTO checks (itinerary_id,row_key,kind,shift_days,cabin,status,price_usd,airline,"
            "stops,duration_min,layovers,booking_url,checked_at,reason) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (
                itinerary_id,
                row_key,
                kind,
                shift_days,
                fare.cabin,
                fare.status,
                fare.price_usd,
                fare.airline,
                fare.stops,
                fare.duration_min,
                json.dumps(fare.layovers),
                fare.booking_url,
                _iso(checked_at),
                fare.reason,
            ),
        )
        self.db.commit()

    def previous_ok_price(self, row_key):
        """Price of the most recent ok check for this row, or None."""
        r = self.db.execute(
            "SELECT price_usd FROM checks WHERE row_key=? AND status='ok' AND price_usd IS NOT NULL "
            "ORDER BY checked_at DESC, id DESC LIMIT 1",
            (row_key,),
        ).fetchone()
        return r["price_usd"] if r else None

    def ok_prices_since(self, row_key, since: datetime):
        rows = self.db.execute(
            "SELECT checked_at, price_usd FROM checks WHERE row_key=? AND status='ok' "
            "AND price_usd IS NOT NULL AND checked_at>=? ORDER BY checked_at",
            (row_key, _iso(since)),
        ).fetchall()
        return [(_parse(r["checked_at"]), r["price_usd"]) for r in rows]

    def latest(self, row_key):
        """Most recent stored check (any status) as a dict, or None."""
        r = self.db.execute(
            "SELECT * FROM checks WHERE row_key=? ORDER BY checked_at DESC, id DESC LIMIT 1", (row_key,)
        ).fetchone()
        if not r:
            return None
        d = dict(r)
        d["layovers"] = json.loads(d["layovers"] or "[]")
        d["checked_dt"] = _parse(d["checked_at"])
        return d

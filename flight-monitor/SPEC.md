# Flight Monitor spec

Tracks the lowest round-trip fare per person (Economy, Business, First) for both Vietnam itineraries, with history, change, and alerts. Checked on **2026-11-02**.

## 1. API recommendation: SerpApi Google Flights

| Candidate | Status / fit |
|---|---|
| **SerpApi Google Flights (chosen)** | Structured JSON of Google Flights results. Supports round trip, one way and multi-city (`type`, `multi_city_json`), cabin filter (`travel_class`: economy, premium economy, business, first), `currency=USD`, and returns `price`, `layovers`, `total_duration` and `search_metadata.google_flights_url`. A free plan exists. [Google Flights API docs](https://serpapi.com/google-flights-api), [pricing](https://serpapi.com/pricing). |
| Amadeus Self-Service | Not usable: the self-service portal was decommissioned on 17 July 2026 and keys were disabled. [PhocusWire](https://www.phocuswire.com/amadeus-shut-down-self-service-apis-portal-developers), [dev.to](https://dev.to/ishemah/amadeus-self-service-shut-down-on-july-17-heres-a-drop-in-replacement-for-flight-prices-1npn). |
| Duffel | Built for searching and booking flights (offer requests, orders), with a per-order fee model. It is a poor fit for a read-only tracker. [Duffel pricing](https://duffel.com/pricing), [offer requests](https://duffel.com/docs/api/offer-requests). |

Why SerpApi: it is the only candidate that is both available and a read-only fare lookup. It handles open-jaw through multi-city, filters by cabin including first, returns USD totals as Google displays them (taxes included), and gives a deep link. Press reports of the free plan quota and paid tiers (250 searches/month free, per third-party summaries dated Aug-Oct 2026) should be re-checked on the [pricing page](https://serpapi.com/pricing) before relying on them.

Re-verify before first live use (these were NOT confirmed against a live key): the exact `multi_city_json` leg format, that multi-city `price` is the total for all legs, the credit cost per search, and the wording of SerpApi's "no results" error.

The provider sits behind `fm/providers/base.py` (`FareProvider.search(query) -> Fare`). To swap providers, add a class and select it in `run_monitor.py`.

## 2. Data model

`flight-monitor/data/latest.json` (also written as `latest.js`: `window.FLIGHT_MONITOR_DATA = {...};`)

```
{ schema_version: 1, mode: "live" | "no_api_key" | "sample", generated_at, last_checked,
  source: {name, url}, thresholds: {...}, sample_notice?,
  itineraries: { <id>: { label, arrive, depart, origin, travelers, outbound_date, return_date,
    rows: [ { id, route, origin, kind: primary|alternate|traveler, traveler_name, cabin,
              status: ok|not_offered|not_verified, reason, airline, stops, duration_min, layovers[],
              price_usd (only when ok), booking_url, checked_at,
              change: {usd, direction}, low_30d, drop_flag,
              shift: {offset_days, dates, price_usd, saving_usd} | null,
              alt_flag, alt_saving_usd, stl_price_usd } ] } } }
```

Statuses: `ok` (real fare returned), `not_offered` (only when the API answered successfully with an explicit no-results message for that cabin AND the Economy query on the same route returned fares), `not_verified` (everything else: errors, timeouts, empty or odd responses, missing key, call budget reached). A cabin is never replaced by another cabin; the provider also rejects any result whose `travel_class` is not the one requested.

History is SQLite at `flight-monitor/data/history.sqlite` (gitignored), table `checks`, one row per check.

## 3. Rules

- Change: current ok price minus the previous ok price for the same row.
- 30-day low: lowest ok price in the trailing 30 days including today.
- Drop flag: price fell by MORE than 10% versus the previous ok check.
- Date shift: both legs moved by -3 and +3 days; flagged when the best shifted price saves $200 or more per person. Shifts run for primary rows in the cabins listed under `cabins_by_kind.shift`, at most every `shift_check_interval_days`.
- Alternate origins (MCI, ORD, ATL): shown only when the same-cabin fare is $300 or more cheaper than STL.
- Open-jaw: one multi-city search per origin and cabin (origin to arrival airport, departure airport back to origin). Same airport: normal round trip.
- Stops, duration, layovers and airline describe the outbound trip as returned by the API; the price is the whole itinerary.

## 4. Config reference (`flight-monitor/config.json`)

| Key | Meaning |
|---|---|
| `home_airport`, `alternate_origins` | STL and the alternates |
| `thresholds` | `drop_pct` 10, `shift_usd` 200, `alt_origin_usd` 300, `shift_days` 3, `low_window_days` 30 |
| `cabins_by_kind` | cabins queried for `primary`, `alternate`, `traveler`, `shift` rows |
| `max_calls_per_run` | API call budget (default 40); rows past it are `not_verified` ("call budget reached") |
| `shift_check_interval_days` | how often shifted dates are re-queried (default 7) |
| `schedule.time` | run time, `HH:mm` local, used by `register_task.ps1` |
| `schedule.frequency` | run cadence; `weekly` (OD5). Drives the quota math and the scheduler |
| `mixed_cabin` | `enabled`, `longhaul_rule` (`longest_oceanic_segment`), `components` (longhaul business / other economy), `pricing_unit` (`per_person`) |
| `travelers` | list of `{ "name", "home_airport" }`; empty by default (no invented people). See `travelers_example` (ignored by code) |
| `itineraries` | per itinerary: `arrive`, `depart`, `outbound_date`, `return_date`, `travelers` (placeholder `[TRAVELER COUNT]`), `travelers_source`, `arrival_requirement` (`land_by`, `candidate_departures`) |

Itinerary values: Option 2 arrives DAD and departs SGN, Nov 21-29 2027. The original arrives HAN and departs SGN, same dates. Each itinerary carries a `travelers` field left as the placeholder `[TRAVELER COUNT]` with `travelers_source` noting it is pending a user-supplied count; because no confirmed count exists, group totals are shown as **not verified** and never multiplied out from a per-person figure. Per-person pricing is always per person.

Derived `outbound_date`: both itineraries use one provisional `outbound_date` of **2027-11-19**. Landing in Vietnam on 2027-11-21 is fixed. The departure is derived from an `arrival_requirement` block (`land_by` plus `candidate_departures` of 2027-11-19 and 2027-11-20) and stays provisional until Part 1 supplies real STL schedule data; all three front-end pages read this one value so there is no Nov-20 / Nov-21 mismatch.

### Arrival logic (`fm/arrival.py`)

Pure, no-I/O logic that turns the `arrival_requirement` into candidate-departure rows the runner prices. It never invents a time: it only enumerates the configured candidate departure dates to compare and leaves the recommendation to real fares. Landing-by date is treated as fixed.

### Mixed cabin (OD3) and its approximation limitation

Mixed cabin = **two** searches: business on the transpacific long-haul leg plus economy on the other legs. It is labelled "Business long-haul + Economy elsewhere, not a single-ticket quote" and a per-person headline is shown **only when both searches return real fares**; otherwise it is `not verified`. The source does not break a single itinerary price down to per-leg dollars, so the mixed-cabin figure is an **approximation** built by summing two separate round-trip-style searches, not a quoted blended single ticket. A blended price is never invented. `longhaul_rule` is `longest_oceanic_segment`; `pricing_unit` is `per_person`.

### Schedule cadence and recomputed quota (OD5)

The monitor runs **weekly** (`schedule.frequency: "weekly"`, with `schedule.time` still the local `HH:mm`). Quota math, CAP = **100** searches/month (FEAT-001 confirmed the free cap at 100 and that multi-city open-jaw uses one `multi_city_json` search per origin and cabin):

- Base queries per run: **16** — two itineraries x (STL x 3 cabins + 3 alternate origins x economy) = 2 x 8 = 16. Candidate-departure and shifted-date queries add a few more per run depending on configuration.
- Weekly: 16 x ~4.3 weeks/month ~= **64-69 searches/month**, comfortably under the 100 cap (vs. the old daily cadence at ~16 x 30 ~= 480/month, which blew past any free tier).

### Mandatory live-run quota guard (`fm/quota.py`)

Before any live path, `run_monitor.py` asks the quota guard to project searches for the run and the month. The guard **refuses to start a live run** that would push the month over CAP = 100 and prints the reason. The refusal/error text never contains the API key or a key-bearing URL. `--dry-run` prints the same projection and makes zero calls; it is the safe way to confirm the guard passes for the weekly cadence.

## 5. Keys and running

1. Copy `.env.example` to `.env` (gitignored), set `SERPAPI_API_KEY`. The key is read only from the environment or `.env`; it is never written to output.
2. `python flight-monitor/run_monitor.py` (no key: succeeds, writes all rows `not_verified`).
3. `python flight-monitor/run_monitor.py --dry-run` prints planned queries and does nothing else.
4. `--mock flight-monitor/tests/fixtures/mock_sample.json` writes labelled SAMPLE output to `flight-monitor/data/sample/` (gitignored). The UI shows no prices for any snapshot that is not `mode: "live"`.
5. Tests: `python -m unittest discover -s flight-monitor/tests -t flight-monitor -v` (no network, no key).

## 6. Scheduling

- Windows: `powershell -ExecutionPolicy Bypass -File flight-monitor/register_task.ps1` (supports `-WhatIf`, `-Unregister`). Reads `schedule.time`; re-run after changing it. The task holds no secrets.
- GitHub Actions: `flight-monitor/examples/daily-refresh.yml.example`. NOT enabled. Copy to `.github/workflows/` and add the repo secret `SERPAPI_API_KEY`. Runners start without `history.sqlite`, so change and 30-day low reset each run.

## 7. Page behaviour

Pages load `data/latest.js` via script tag (works from `file://`), then try `fetch('flight-monitor/data/latest.json')` for fresher data. If neither works, rows render as "not verified" with an explanation.

## 8. Limitations

- November 2027 is at or beyond the roughly 330-355 day schedule window of most airlines as of 2026-11-02, so "not verified" will be common. That is a valid result, not an error.
- The booking link is the Google Flights search for that query. It is not a guaranteed fare.
- Prices are per person (adults=1), USD, as Google Flights reports them.
- Layovers and stops are for the outbound trip only.
- The itinerary's older copy `keysha-vietnam-site/` was left untouched.

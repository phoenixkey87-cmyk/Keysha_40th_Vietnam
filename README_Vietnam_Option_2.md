# Vietnam Option 2: Key's 40th Birthday Experience

A standalone luxury travel itinerary site for November 21-29, 2027 (Da Nang, then Ho Chi Minh City). The original itinerary (`vietnam_itinerary_site.html`) is linked from the nav, hero and footer. It now also carries its own Flight Monitor section (additive only).

Everything on the site is a proposal. Nothing is booked. Figures taken from dated guides or listings are labelled Estimated, and plans are labelled Proposed. Fields with no published value are left out of the card.

## How to run

Open `Vietnam_Option_2.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

then visit `http://localhost:8000/Vietnam_Option_2.html`. There is no build step and no API key.

## Structure

```
Vietnam_Option_2.html
vietnam-option-2/
  css/styles.css, print.css
  js/app.js        core: nav, theme, hero, countdown, itinerary, wishlist, print
  js/sections.js   hotels, dining, nightlife, cafes, shopping, wellness
  js/budget.js     budget planner
  js/map.js        Leaflet map
  js/verify.js     verification list and photo credits
  js/data/         content as plain scripts (window.VO2_DATA.*)
  js/vendor/leaflet/  Leaflet 1.9.4 with its LICENSE and marker images
  images/          locally stored licensed photos
```

## Editing content

Each file in `vietnam-option-2/js/data/` assigns a list to `window.VO2_DATA`: `itinerary`, `hotels`, `dining`, `nightlife`, `cafes`, `shopping`, `medical`, `mappoints`, `budget`, `credits`. Every record has `status` (verified, estimated or proposed), `sourceUrl` and `checkedDate`. Set an unknown field to `null` and the page leaves that row out. When you verify something, update the value, set `status` to `verified`, and add the source and date. To add a photo, put it under `images/` and add a matching entry in `credits.js`.

## Booking, reservation and inquiry links

Hotels, dining, nightlife and wellness records may carry a `bookingLinks` list. The renderer in `js/sections.js` turns each entry into a Book, Reserve or Inquire button, and shows a short "reserve by contacting the venue" line when the list is empty or missing. `via` can also be `chat` (WhatsApp or Zalo), `maps` (Google Maps listing) or `social`. Do not invent URLs, affiliate codes or prices.

```
bookingLinks: [
  { kind: "book",            // "book" | "reserve" | "inquire"
    via: "official",         // "official" site/engine, or "ota" (then set otaName, e.g. "Booking.com")
    url: "https://...",      // https only; anything else is not rendered
    check: "fetched",        // "fetched" (responded) or "unverified-by-bot" (blocks bots; confirmed from search results)
    checkedDate: "2026-11-02",
    datesIncluded: "2027-11-21 to 2027-11-24",  // optional; only when the URL date format is proven to work
    note: "Shown under the buttons." }          // optional
]
```

Rules used: official booking page or official contact/reservation page first. A Booking.com page is used only when search results show it is the exact property. Dates go in a URL only where the format was confirmed (currently the Fusion Resort booking engine only). Links open in a new tab with `rel="noopener noreferrer"`, and each button's accessible name includes the property and says it opens in a new tab. Each section also carries a short note that links lead to external sites and that November 2027 rates and availability must be checked there.

The flight helper reads `window.VO2_DATA.flightSearches` (in `data/itinerary.js`): `from`, `to` (airport codes), `date` and `label`. It builds a Google Flights search link and is a search only, never a booking.

## Functionality

- Countdown to November 23, 2027, hero slides, light and dark theme, mobile menu.
- Itinerary accordion for all nine days, with a featured birthday day.
- Hotel filters and side-by-side comparison of up to three hotels, against the $170 per room per night target. Da Nang lists only verified beachfront upscale hotels; those above $170 are marked "Over $170 budget — share a room to split the cost" with a per-person split for 2 guests over 3 nights. Filters include Within budget and Shared room (over budget).
- Dining, nightlife (with music filters), cafés and shopping, each with map links where known.
- Wellness section with medical disclaimers.
- Wishlist saved on the device.
- Budget planner: editable quantities and unit costs, travellers, hotel calculator, donut chart with table fallback, VND conversion with an editable rate, save, reset, CSV export, print. Saved under the `vo2_budget` key.
- Map with city toggle and category filters; falls back to a list of Google Maps links if the library or tiles do not load.
- Print stylesheet.

## Dependencies

- Leaflet 1.9.4 (BSD-2-Clause), stored in `js/vendor/leaflet/`.
- OpenStreetMap tiles (loaded online; attribution shown on the map).
- No web fonts; system fonts only.

## Image credits

All 41 photographs are from Wikimedia Commons under CC0, CC BY, CC BY-SA or public domain licences. Author, licence and source for each are listed in the on-page Photo Credits section (data in `js/data/credits.js`). Some photos illustrate the place or type of venue rather than the exact venue; cards say so.

## Open items

See `VERIFICATION_NEEDED_Vietnam_Option_2.md`.

## Flight Monitor

Daily-refreshed lowest round-trip fares per person (Economy, Business, First) from STL, with change, 30-day low and alerts. Full details: `flight-monitor/SPEC.md`.

- Data source: SerpApi Google Flights. Fares the source does not return show as "not verified"; prices are never estimated.
- Setup: copy `.env.example` to `.env`, set `SERPAPI_API_KEY`, then run `python flight-monitor/run_monitor.py`.
- Daily schedule (Windows): `powershell -ExecutionPolicy Bypass -File flight-monitor/register_task.ps1`. The time is `schedule.time` in `flight-monitor/config.json`.
- Other home airports: add `{ "name": ..., "home_airport": "XXX" }` entries to `travelers` in `flight-monitor/config.json`.
- Works from disk: the runner also writes `flight-monitor/data/latest.js`, loaded by a script tag.
- Tests: `python -m unittest discover -s flight-monitor/tests -t flight-monitor -v`.
- On this page the Flight Monitor sits between the hero and the itinerary (nav link: Flights). The group total uses the budget traveller count and stays hidden at 1.

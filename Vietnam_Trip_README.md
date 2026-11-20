# Keysha's 40th Birthday Escape — Vietnam 2027
## Phoenix Travels Project Files

---

### Live Website
**Main Site:** https://phoenixkey87-cmyk.github.io/Keysha_40th_Vietnam/
**RSVP Form:** https://phoenixkey87-cmyk.github.io/Keysha_40th_Vietnam/vietnam_rsvp.html

---

### File Overview

| File | Purpose |
|------|---------|
| `index.html` | The single merged itinerary website (source file, served by GitHub Pages) |
| `vietnam_itinerary_site.html` | Byte-identical twin of `index.html` (see "Keeping the twin in sync") |
| `vendor/leaflet/` | Leaflet map library used by the Map section (must be deployed) |
| `vietnam_rsvp.html` | RSVP form with Formspree integration |
| `Keysha_40th_Vietnam_Itinerary.docx` | Polished Word document itinerary for distribution |
| `create_vietnam_itinerary.py` | Python script that generates the Word doc (re-run to update) |
| `trip_todo_list.html` | Personal to-do list with Vietnam tab (payments + action items) |
| `images/Vietnam.webp` | Ha Long Bay hero image |
| `.agents/tasks/merge-itineraries/verification.md` | Open items still to confirm (see "Unconfirmed items") |
| `Itineraries/Phoenix-01.png` | Phoenix Travels logo (RGB, converted from CMYK) |
| `Itineraries/Phoenix-01.jpg` | Original logo file (CMYK) |

---

### GitHub Repository
- **Repo:** https://github.com/phoenixkey87-cmyk/Keysha_40th_Vietnam
- **Hosting:** GitHub Pages (deploys from `main` branch, root folder)
- **Deployed files:** `index.html`, `vietnam_rsvp.html`, `Phoenix-01-320.webp`, `Vietnam.webp`, `vendor/leaflet/`, `flight-monitor/`

---

### Formspree (RSVP Submissions)
- **Endpoint:** https://formspree.io/f/mwvdzlav
- **Submissions go to:** Your Formspree account email
- **Subject line:** "New RSVP: Keysha's 40th Vietnam Trip"
- **After submit:** Redirects back to RSVP page with success message

---

### Payment Methods (displayed on site + RSVP)
- Venmo: @PhoenixTravel
- CashApp: @PhoenixTravel
- PayPal: @ohphoenix

---

### Payment Schedule
| Due Date | Amount | Covers |
|----------|--------|--------|
| January 2027 | $250 | Deposit (non-refundable) |
| March 2027 | $900 | Genesis Regal Luxury Cruise |
| May 2027 | $750 | Hotels (Hanoi, Hoi An, HCMC) |
| July 2027 | $350 | Domestic flights |
| September 2027 | $500 | Transfers, Hoi An transport, dinner, activities |
| October 2027 | Final balance | Remaining + final itinerary |

---

### One Merged Itinerary
`index.html` is the only itinerary. The old Option 2 page (`Vietnam_Option_2.html`), its `vietnam-option-2/` folder and the Original / Option 2 toggle no longer exist. Everything from both options was merged into `index.html`, keeping the Option 1 format.

**Booked route (fixed):** Anatole Hotel Hanoi (Nov 21–23), Genesis Regal cruise (Nov 23–24), Silk Sense Hoi An River Resort (Nov 24–26), Hotel Grand Saigon (Nov 26–29).

**Sections (nav order):** Welcome, Snapshot, Flights (Flight Monitor), Travel Options, Destinations, Day-by-Day (nine days, each with Morning / Afternoon / Evening plans), Hotels, Dining, Nightlife, Cafés, Shopping, Wellness, Budget, Map, Safety, Weather, Packing, Payment, Visa, Tips.

**Where the additions are:**
- Coffee: The Note Coffee (Nov 22, Hanoi), Faifo Coffee (Nov 25, Hoi An), Saigon cafe route (Nov 28)
- Wellness days: Nov 25 (Hoi An) and Nov 27 (Saigon)
- Shopping blocks: Nov 22, 25, 26, 27, 28, 29
- Nightlife: Nov 21, 24, 25, 26, 27, 28
- Waterfront Danang Restaurant & Bar: Nov 24 evening

**Not carried over from Option 2:** photos and photo credits, dark mode, wishlist, countdown, confetti, and the interactive budget calculator (now a static Budget table). The `option2` entry in `flight-monitor/config.json` is unused and was left in place.

**Backup of Option 2:** `C:\Users\lstrickland\Impact modification report\Keysha Tinkering\Vietnam_Option_2_backup.zip` (outside the repo; 67 files: the HTML page, CSS, JS, data and 41 images).

**GitHub Pages:** once the deletion is pushed, the old `.../Vietnam_Option_2.html` URL returns a 404. Any link shared to it will break.

---

### Map
The Map section shows 42 places (hotels, dining, nightlife, cafés, shopping, wellness, airports and the cruise area, including Waterfront Danang). It uses Leaflet from `vendor/leaflet/` and OpenStreetMap tiles. **`vendor/` must be committed and deployed, or the map will not load** (the page falls back to a list of Google Maps links). Some pins are approximate; each popup has a Google Maps link to confirm.

---

### Unconfirmed items
Open items to check (Lotus Spa name at Silk Sense, Hotel Grand Saigon spa name and hours, Piu Piu, Mershe Saigon, Afro Chill Lounge, approximate map pins) are listed in `.agents/tasks/merge-itineraries/verification.md`.

---

### Keeping the twin in sync
`vietnam_itinerary_site.html` must stay byte-identical to `index.html`. After every edit to `index.html`, run from the repo root:

```powershell
Copy-Item index.html vietnam_itinerary_site.html -Force
(Get-FileHash index.html).Hash -eq (Get-FileHash vietnam_itinerary_site.html).Hash   # must print True
```

---

### How to Update

**Website:**
1. Edit `index.html` (or `vietnam_rsvp.html`). Never edit `vietnam_itinerary_site.html` directly.
2. Re-sync the twin (see below)
3. Push to GitHub (via GitHub Desktop or command line), including `vendor/`
4. Site updates automatically within 1-2 minutes

**Word Document:**
1. Edit `create_vietnam_itinerary.py`
2. Run: `python create_vietnam_itinerary.py`
3. New `.docx` is generated in the same folder

**To-Do List:**
- Edit `trip_todo_list.html` directly — it's the Vietnam tab (page 4)

---

### Key Links for Travelers
- Vietnam e-visa: https://evisa.gov.vn
- U.S. Embassy STEP: https://step.state.gov
- Travel insurance: https://www.allianztravelinsurance.com/
- Genesis Regal Cruise: https://genesisregalcruise.com/
- Anan Saigon (farewell dinner): https://anansaigon.com/

---

### Trip Summary
- **Dates:** November 21–29, 2027
- **Route:** Hanoi → Genesis Regal cruise → Hoi An (via Da Nang airport) → Ho Chi Minh City
- **Hanoi Hotel:** Anatole Hotel Hanoi, Nov 21–23 (2 nights, itinerary #73592356274642)
- **Cruise:** Genesis Regal Luxury Cruise, Nov 23–24 (2 days / 1 night)
- **Hoi An Hotel:** Silk Sense Hoi An River Resort, Nov 24–26 (2 nights, itinerary #73592431490681)
- **HCMC Hotel:** Hotel Grand Saigon, Nov 26–29 (3 nights)
- **Da Nang dinner:** Waterfront Danang Restaurant & Bar, Nov 24 evening
- **Flights:** Multi-city (fly INTO Hanoi HAN, fly HOME from HCMC SGN)
- **Budget:** $2,750–$3,250 per person (excl. international airfare)
- **Theme Night:** All Black Everything (Nov 28)
- **Birthday:** November 23 (at sea)

## Flight Monitor

Daily-refreshed lowest round-trip fares per person (Economy, Business, First) from STL, with change, 30-day low and alerts. Full details: `flight-monitor/SPEC.md`.

- Data source: SerpApi Google Flights. Fares the source does not return show as "not verified"; prices are never estimated.
- Setup: copy `.env.example` to `.env`, set `SERPAPI_API_KEY`, then run `python flight-monitor/run_monitor.py`.
- Daily schedule (Windows): `powershell -ExecutionPolicy Bypass -File flight-monitor/register_task.ps1`. The time is `schedule.time` in `flight-monitor/config.json`.
- Other home airports: add `{ "name": ..., "home_airport": "XXX" }` entries to `travelers` in `flight-monitor/config.json`.
- Works from disk: the runner also writes `flight-monitor/data/latest.js`, loaded by a script tag.
- Tests: `python -m unittest discover -s flight-monitor/tests -t flight-monitor -v`.
- On this page the Flight Monitor section is between Snapshot and Destinations (nav link: Flights).
- `index.html` and `vietnam_itinerary_site.html` are hand-edited static pages (the generator `create_vietnam_itinerary.py` only builds the Word document), so the section was patched into `index.html` and copied to the twin. Both files remain identical.
- `keysha-vietnam-site/` is an older deploy copy and was not changed.

| New file | Purpose |
|---|---|
| `flight-monitor/ui/flight-monitor.js`, `.css` | shared renderer and styles |
| `flight-monitor/data/latest.json`, `latest.js` | latest snapshot |
| `flight-monitor/config.json` | routes, thresholds, schedule, travelers |

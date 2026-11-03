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
| `vietnam_itinerary_site.html` | Customer-facing website (source file) |
| `vietnam_rsvp.html` | RSVP form with Formspree integration |
| `Keysha_40th_Vietnam_Itinerary.docx` | Polished Word document itinerary for distribution |
| `create_vietnam_itinerary.py` | Python script that generates the Word doc (re-run to update) |
| `trip_todo_list.html` | Personal to-do list with Vietnam tab (payments + action items) |
| `images/Vietnam.webp` | Ha Long Bay hero image |
| `Itineraries/Phoenix-01.png` | Phoenix Travels logo (RGB, converted from CMYK) |
| `Itineraries/Phoenix-01.jpg` | Original logo file (CMYK) |

---

### GitHub Repository
- **Repo:** https://github.com/phoenixkey87-cmyk/Keysha_40th_Vietnam
- **Hosting:** GitHub Pages (deploys from `main` branch, root folder)
- **Deployed files:** `index.html`, `vietnam_rsvp.html`, `Phoenix-01.png`, `Vietnam.webp`

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
| May 2027 | $750 | Hotels (Hanoi, Da Nang, HCMC) |
| July 2027 | $350 | Domestic flights |
| September 2027 | $500 | Transfers, Hoi An transport, dinner, activities |
| October 2027 | Final balance | Remaining + final itinerary |

---

### How to Update

**Website:**
1. Edit `vietnam_itinerary_site.html` or `vietnam_rsvp.html`
2. Copy updated file to `Keysha_40th_Vietnam_repo\` folder
3. Push to GitHub (via GitHub Desktop or command line)
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
- **Route:** Hanoi → Cruise → Da Nang / Hoi An → Ho Chi Minh City
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
- `index.html` and `vietnam_itinerary_site.html` are hand-edited static pages (the generator `create_vietnam_itinerary.py` only builds the Word document), so the section was patched into both HTML files by hand. The change is additive; both files remain identical.
- `keysha-vietnam-site/` is an older deploy copy and was not changed.

| New file | Purpose |
|---|---|
| `flight-monitor/ui/flight-monitor.js`, `.css` | shared renderer and styles |
| `flight-monitor/data/latest.json`, `latest.js` | latest snapshot |
| `flight-monitor/config.json` | routes, thresholds, schedule, travelers |

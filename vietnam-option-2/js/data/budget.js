window.VO2_DATA = window.VO2_DATA || {};
// Budget defaults (USD). unitUsd 0 = not yet researched / not set. Everything is editable in the UI.
// status "estimated" rows are planning figures to edit, not quotes. Shopping defaults to 0 and is excluded from fixed totals until the user enters an amount.
window.VO2_DATA.budgetFx = {
  vndPerUsd: 25631,
  asOf: "2026-11-02",
  source: "State Bank of Vietnam daily reference rate, reported by VietnamPlus",
  sourceUrl: "https://en.vietnamplus.vn/reference-exchange-rate-down-6-vnd-at-weeks-beginning-post354660.vnp",
  note: "A reference rate from late 2026, not a forecast for Nov 2027. Editable. Banks and exchange counters use different buy and sell rates (for example Vietcombank sold USD at 25,990 on Nov 2, 2026)."
};
window.VO2_DATA.budgetDefaults = {
  travellers: 1,
  hotelCapUsdPerNight: 170,
  sharedRoomGuests: 2,
  hotelNights: { "Da Nang": 3, "Ho Chi Minh City": 5 }
};
window.VO2_DATA.budget = [
  { id: "bud-hotels", category: "Hotels", qty: 8, unit: "nights", unitUsd: 120, status: "estimated", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, linkedToHotels: true, excludeFromTotals: false, note: "Planning figure: 8 nights (Da Nang 3, HCMC 5) at an average near the USD 170 target (Da Nang beachfront hotels above it can be shared by two). Use the hotel calculator to replace it." },
  { id: "bud-domestic-flight", category: "Domestic flight", qty: 1, unit: "ticket", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Da Nang to Ho Chi Minh City on Nov 24. Fare not researched; enter a quote." },
  { id: "bud-transfers", category: "Airport transfers", qty: 4, unit: "transfers", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Private transfers at both airports, in and out. No quotes yet." },
  { id: "bud-michelin", category: "Michelin dining", qty: 1, unit: "dinners", unitUsd: 115, status: "verified", sourceUrl: "https://anansaigon.com/booking/", checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Ănăn Saigon Saigon Tasting Menu food only, listed at US$115 per person on 2026-11-02. Drinks pairings extra; Check the 2027 price when booking." },
  { id: "bud-birthday-dinner", category: "Birthday dinner", qty: 1, unit: "dinners", unitUsd: 0, status: "proposed", sourceUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/", checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "La Maison 1888 menu price was not listed on the page checked. Deposit is VND 1,000,000 per guest. Enter the quoted price." },
  { id: "bud-nightlife", category: "Nightlife", qty: 3, unit: "nights", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Cover and table minimums are mostly unpublished. Third-party guides mention table minimums from about VND 3.5 million." },
  { id: "bud-medical-physical", category: "Medical physical", qty: 1, unit: "exam", unitUsd: 652, status: "estimated", sourceUrl: "https://www.fvhospital.com/en/news/enjoy-double-discounts-when-you-register-for-a-comprehensive-health-check-up-programme-at-fv/", checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "FV Executive programme list price of 16,700,000 VND, about US$650. Standard (4,800,000 VND) and Extensive (7,800,000 VND) packages cost less." },
  { id: "bud-dental", category: "Dental cleaning", qty: 1, unit: "visit", unitUsd: 36, status: "estimated", sourceUrl: "https://hcmcdental.com/treatments/dental-cleaning/", checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "HCMC Dental lists a deep clean from US$36 (scaling from US$12) on its own site." },
  { id: "bud-facial", category: "Facial treatments", qty: 1, unit: "treatment", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "No verified price." },
  { id: "bud-body-contouring", category: "Body contouring", qty: 1, unit: "consultation", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Consultation first; any treatment cost depends on a physician's advice. No guaranteed results." },
  { id: "bud-spa", category: "Spa & massages", qty: 3, unit: "treatments", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Hotel spa menus not captured." },
  { id: "bud-shopping", category: "Shopping", qty: 1, unit: "budget", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: true, note: "Defaults to 0 and is left out of fixed totals until you enter an amount." },
  { id: "bud-excursions", category: "Excursions", qty: 1, unit: "outing", unitUsd: 3, status: "estimated", sourceUrl: "https://danangfantasticity.com/en/culture-en/the-marble-mountains", checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Marble Mountains entry is 40,000 VND per adult plus 30,000 VND for a round-trip elevator, about US$3 in total. Add other outings as you choose them." },
  { id: "bud-food", category: "Food & beverages", qty: 9, unit: "days", unitUsd: 50, status: "estimated", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Planning allowance per day for meals other than the dinners above. Edit me." },
  { id: "bud-contingency", category: "Contingency fund", qty: 1, unit: "fund", unitUsd: 0, status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", image: null, imageAlt: null, excludeFromTotals: false, note: "Set aside an amount for changes and surprises." }
];

window.VO2_DATA = window.VO2_DATA || {};
// Itinerary: 9 calendar days / 8 nights, Nov 21-29, 2027. Everything is a proposal.
// Note: international flight schedules may require shifting the first or last day.
window.VO2_DATA.itinerary = [
  {
    id: "day-2027-11-21", date: "2027-11-21", dayNumber: 1, city: "Da Nang", theme: "Arrival and Luxury Welcome",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/hero/my-khe-beach.jpg", imageAlt: "My Khe Beach in Da Nang with long sandy shoreline and calm water",
    note: "Arrival time depends on international flight schedules; this day may shift.",
    activities: [
      { id: "a-1-1", slot: "Arrival", title: "Arrive in Da Nang", detail: "Arrival time depends on the final international flight schedule." },
      { id: "a-1-2", slot: "Transfer", title: "Private airport transfer", detail: "Proposed: pre-booked private car. Ask your hotel or a driver service for a transfer quote." },
      { id: "a-1-3", slot: "Check-in", title: "Check in to an upscale beachfront hotel", detail: "Hotel choice open. See the hotel comparison.", linkedId: "hotel-hyatt-regency-danang" },
      { id: "a-1-4", slot: "Evening", title: "Welcome cocktails", detail: "Proposed: a rooftop or hotel bar to unwind after travel.", linkedId: "night-the-roof-danang" },
      { id: "a-1-5", slot: "Evening", title: "Relaxing massage or spa treatment", detail: "Proposed: book through the hotel spa. The hotel spa sets the treatment menu and price.", linkedId: null },
      { id: "a-1-6", slot: "Dinner", title: "Oceanfront dinner", detail: "Proposed: a restaurant near My Khe Beach. Choose the venue when you reserve.", linkedId: null }
    ]
  },
  {
    id: "day-2027-11-22", date: "2027-11-22", dayNumber: 2, city: "Da Nang", theme: "Exploration and Cafe Hopping",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/general/marble-mountains.jpg", imageAlt: "Limestone peaks and pagodas of the Marble Mountains near Da Nang",
    note: "Marble Mountains visit is weather permitting.",
    activities: [
      { id: "a-2-1", slot: "Morning", title: "Breakfast at a beautiful coffee shop", detail: "See the Da Nang cafe hopping route.", linkedId: "cafe-xliii-danang" },
      { id: "a-2-2", slot: "Late morning", title: "Marble Mountains (weather permitting)", detail: "Five limestone and marble hills south of the city centre with caves and pagodas. Open daily 7:00 to 17:30. Entry is 40,000 VND per adult (about US$1.60), with an optional elevator at 15,000 VND one way (Da Nang tourism portal)." },
      { id: "a-2-3", slot: "Afternoon", title: "Scenic Da Nang attractions", detail: "Options include Dragon Bridge, Son Tra Peninsula views and the Han River promenade." },
      { id: "a-2-4", slot: "Afternoon", title: "Shopping and local markets", detail: "Han Market for fabrics, souvenirs and snacks.", linkedId: "shop-han-market" },
      { id: "a-2-5", slot: "Late afternoon", title: "Afternoon spa experience", detail: "Proposed: hotel or independent spa; the hotel front desk can arrange it." },
      { id: "a-2-6", slot: "Evening", title: "Rooftop cocktails or R&B / Afrobeats night out", detail: "Venues listed in Nightlife. No November 2027 events are confirmed.", linkedId: "night-blends-danang" }
    ]
  },
  {
    id: "day-2027-11-23", date: "2027-11-23", dayNumber: 3, city: "Da Nang", theme: "Key's 40th Birthday",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true, isBirthday: true,
    image: "vietnam-option-2/images/hero/dragon-bridge-night.jpg", imageAlt: "Dragon Bridge and the Han River skyline in Da Nang lit up at night",
    note: "Birthday dinner is subject to reservation availability and budget.",
    activities: [
      { id: "a-3-1", slot: "Morning", title: "Luxury birthday breakfast", detail: "Proposed: in-room or hotel signature breakfast." },
      { id: "a-3-2", slot: "Late morning", title: "Birthday spa experience", detail: "Proposed: couples-style relaxation, facial or massage. Book through the hotel spa." },
      { id: "a-3-3", slot: "Afternoon", title: "Professional birthday photographs", detail: "Proposed: local photographer at the beach or Dragon Bridge. Agree the fee when you book a photographer." },
      { id: "a-3-4", slot: "Late afternoon", title: "Free time for dressing and preparation", detail: "Rest, hair and make-up, and outfit time." },
      { id: "a-3-5", slot: "Dinner", title: "Birthday dinner at La Maison 1888", detail: "Subject to reservation availability and budget. See the dining section for verified details.", linkedId: "dine-la-maison-1888" },
      { id: "a-3-6", slot: "Night", title: "Birthday cocktails and nightlife", detail: "Rooftop cocktails then a club. No event is confirmed for this date.", linkedId: "night-sky36-danang" }
    ]
  },
  {
    id: "day-2027-11-24", date: "2027-11-24", dayNumber: 4, city: "Da Nang to Ho Chi Minh City", theme: "Travel to Ho Chi Minh City",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/hero/saigon-skyline.jpg", imageAlt: "Ho Chi Minh City skyline with high-rise towers beside the Saigon River",
    note: "Domestic flight times and fares are set by the airlines; use the Google Flights helper above to compare.",
    activities: [
      { id: "a-4-1", slot: "Morning", title: "Breakfast and checkout", detail: "Allow time before the airport transfer." },
      { id: "a-4-2", slot: "Midday", title: "Domestic flight Da Nang to Ho Chi Minh City", detail: "Proposed: a short domestic flight. Use the Google Flights helper to compare airlines, schedules and fares." },
      { id: "a-4-3", slot: "Afternoon", title: "Private airport transfer", detail: "Proposed: pre-booked private car to District 1." },
      { id: "a-4-4", slot: "Afternoon", title: "Luxury hotel check-in", detail: "Hotel choice open.", linkedId: "hotel-la-siesta-premium" },
      { id: "a-4-5", slot: "Evening", title: "Relaxing evening and dinner", detail: "Easy dinner near the hotel.", linkedId: null }
    ]
  },
  {
    id: "day-2027-11-25", date: "2027-11-25", dayNumber: 5, city: "Ho Chi Minh City", theme: "Medical and Wellness Day",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/medical/fv-hospital.jpg", imageAlt: "Exterior of FV Hospital in Ho Chi Minh City",
    note: "Appointments, exam contents and prices must be confirmed with each provider. Informational only, not medical advice.",
    activities: [
      { id: "a-5-1", slot: "Morning", title: "Comprehensive physical examination", detail: "Candidate: FV Hospital (JCI-accredited per its website). FV lists Standard, Extensive and Executive packages with prices on its site.", linkedId: "med-fv-hospital" },
      { id: "a-5-2", slot: "Midday", title: "Dental cleaning at a licensed clinic", detail: "Candidate clinics are in the Wellness section; ask the clinic for its licence before booking.", linkedId: "med-hcmc-dental" },
      { id: "a-5-3", slot: "Afternoon", title: "Wellness consultation", detail: "Bring a list of current medications and your medical history to discuss with clinicians." },
      { id: "a-5-4", slot: "Evening", title: "Relaxed evening and dinner", detail: "Light schedule after appointments.", linkedId: null }
    ]
  },
  {
    id: "day-2027-11-26", date: "2027-11-26", dayNumber: 6, city: "Ho Chi Minh City", theme: "Beauty and Body Treatments",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/general/notre-dame.jpg", imageAlt: "Notre-Dame Cathedral Basilica of Saigon in Ho Chi Minh City",
    note: "No result is guaranteed. Treatment eligibility, recovery time and scheduling require medical confirmation after an in-person consultation.",
    activities: [
      { id: "a-6-1", slot: "Morning", title: "Physician consultation about noninvasive body contouring", detail: "A doctor decides whether any treatment is suitable. Eligibility, recovery and scheduling require medical confirmation; results vary and are not guaranteed.", linkedId: "med-fmp-dermatology" },
      { id: "a-6-2", slot: "Morning", title: "Compare options for abdomen and back, and skin tightening", detail: "Ask each clinic about the technology used, number of sessions, downtime, risks and cost. Nothing is booked until a physician advises.", linkedId: null },
      { id: "a-6-3", slot: "Midday", title: "Facial treatment", detail: "Cosmetic spa service; separate from medical treatment. Confirm skin suitability with the provider." },
      { id: "a-6-4", slot: "Afternoon", title: "Shopping or relaxation", detail: "Depends on the clinic's aftercare advice." },
      { id: "a-6-5", slot: "Dinner", title: "Dinner at an upscale restaurant", detail: "Option: a rooftop or hotel restaurant in District 1.", linkedId: "dine-social-club-saigon" }
    ]
  },
  {
    id: "day-2027-11-27", date: "2027-11-27", dayNumber: 7, city: "Ho Chi Minh City", theme: "Luxury Shopping and Michelin Dining",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/shopping/dong-khoi.jpg", imageAlt: "Dong Khoi Street in central Ho Chi Minh City",
    note: "Ănăn Saigon dinner is subject to availability. Reservations are by email.",
    activities: [
      { id: "a-7-1", slot: "Morning", title: "Breakfast at an aesthetically beautiful cafe", detail: "See the Ho Chi Minh City cafe route.", linkedId: "cafe-the-workshop" },
      { id: "a-7-2", slot: "Late morning", title: "Saigon Centre and Takashimaya", detail: "Department store and mall on Le Loi.", linkedId: "shop-saigon-centre-takashimaya" },
      { id: "a-7-3", slot: "Afternoon", title: "Explore Dong Khoi Street", detail: "Historic shopping street with boutiques and architecture.", linkedId: "shop-dong-khoi" },
      { id: "a-7-4", slot: "Afternoon", title: "Visit Ben Thanh Market", detail: "Souvenirs, textiles and snacks. Bargaining is customary at markets.", linkedId: "shop-ben-thanh" },
      { id: "a-7-5", slot: "Dinner", title: "Michelin-starred dinner at Ănăn Saigon (subject to availability)", detail: "Dinner only, Tuesday to Sunday per its website. Pre-booking is required for tasting menus.", linkedId: "dine-anan-saigon" },
      { id: "a-7-6", slot: "Night", title: "Evening cocktails", detail: "Rooftop or hotel bar.", linkedId: "dine-saigon-saigon-rooftop" }
    ]
  },
  {
    id: "day-2027-11-28", date: "2027-11-28", dayNumber: 8, city: "Ho Chi Minh City", theme: "Culture, Cafes and Nightlife",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/cafes/cafe-apartment.jpg", imageAlt: "The Cafe Apartment building at 42 Nguyen Hue in Ho Chi Minh City",
    note: "Weeknd SGN lists Friday to Sunday opening; Nov 28, 2027 is a Sunday. Confirm before planning around it.",
    activities: [
      { id: "a-8-1", slot: "Morning", title: "Cafe Apartments at 42 Nguyen Hue", detail: "A multi-storey apartment block with independent cafes and shops.", linkedId: "cafe-apartment-42-nguyen-hue" },
      { id: "a-8-2", slot: "Late morning", title: "Specialty coffee shops", detail: "Follow the cafe route.", linkedId: "cafe-the-workshop" },
      { id: "a-8-3", slot: "Afternoon", title: "Optional cultural sightseeing", detail: "Options: Notre-Dame Cathedral Basilica, Central Post Office, Opera House, City Hall." },
      { id: "a-8-4", slot: "Evening", title: "Rooftop cocktails", detail: "Skyline views before the club.", linkedId: "dine-saigon-saigon-rooftop" },
      { id: "a-8-5", slot: "Night", title: "R&B, hip-hop or Afrobeats club night", detail: "Venue options in Nightlife. No November 2027 event is confirmed.", linkedId: "night-weeknd-sgn" }
    ]
  },
  {
    id: "day-2027-11-29", date: "2027-11-29", dayNumber: 9, city: "Ho Chi Minh City", theme: "Departure",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02", tentative: true,
    image: "vietnam-option-2/images/hero/saigon-night.jpg", imageAlt: "Ho Chi Minh City skyline at night",
    note: "Departure depends on the international flight schedule, which may change this day.",
    activities: [
      { id: "a-9-1", slot: "Morning", title: "Breakfast", detail: "Relaxed final breakfast." },
      { id: "a-9-2", slot: "Late morning", title: "Last-minute shopping if flight timing allows", detail: "Ben Thanh Market or Saigon Centre are close to District 1 hotels.", linkedId: "shop-ben-thanh" },
      { id: "a-9-3", slot: "Midday", title: "Checkout and private airport transfer", detail: "Leave generous time for international check-in." },
      { id: "a-9-4", slot: "Departure", title: "Departure from Ho Chi Minh City", detail: "Subject to flight confirmation." }
    ]
  }
];

// Flight SEARCH links only (Google Flights). Not bookings, fares or schedules. Query format: "Flights from X to Y on YYYY-MM-DD oneway".
window.VO2_DATA.flightSearches = [
  { id: "fs-dad-sgn", label: "Search Da Nang to Ho Chi Minh City flights, Nov 24, 2027 (Google Flights)", from: "DAD", to: "SGN", date: "2027-11-24", status: "proposed", checkedDate: "2026-11-02" }
];
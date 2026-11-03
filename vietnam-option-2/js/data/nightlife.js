window.VO2_DATA = window.VO2_DATA || {};
// Nightlife. Genre keys: rnb-90s2000s, oldschool, trap, afro, neosoul.
// No venue schedule below is confirmed for November 2027. genreMatch "approximate" means the source names a broad genre
// (e.g. "hip-hop", "R&B") without an era or sub-style, so the filter tag is a best fit only.
// Opening days/hours come from dated third-party guides unless stated. Entry fees, VIP and dress codes are null unless a source gives them.
window.VO2_DATA.nightlifeGenres = [
  { key: "rnb-90s2000s", label: "90s and 2000s R&B" },
  { key: "oldschool", label: "Old-school hip-hop" },
  { key: "trap", label: "Current hip-hop and trap" },
  { key: "afro", label: "Afrobeats and Amapiano" },
  { key: "neosoul", label: "Neo-soul" }
];
window.VO2_DATA.nightlife = [
  {
    id: "night-the-roof-danang", city: "Da Nang", name: "The Roof Da Nang",
    status: "verified", sourceUrl: "https://www.theroofdanang.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/nightlife/dragon-bridge.jpg", imageAlt: "Dragon Bridge in Da Nang lit at night",
    imageNote: "City night photo; not the venue.",
    venueType: "Rooftop bar and lounge", location: "3rd floor, 1A Vo Nguyen Giap, Son Tra, above East West Brewing, overlooking My Khe Beach",
    genres: [], genreMatch: null, genresText: null,
    themedNights: null, dressCode: null, entryFee: null, vip: null, hours: null,
    website: "https://www.theroofdanang.com/", instagram: null,
    bookingLinks: [
      { kind: "reserve", via: "official", url: "https://www.theroofdanang.com/book-a-table", check: "fetched", checkedDate: "2026-11-02", note: "Official table request form. Per the form, reservations run 2PM to 8PM and later arrivals are walk-in only." }
    ],
    mapQuery: "The Roof Da Nang, 1A Vo Nguyen Giap, Son Tra, Da Nang",
    note: "Location and the table-request form come from the venue\u0027s own website. Ask about music, cover and dress code when you request a table."
  },
  {
    id: "night-blends-danang", city: "Da Nang", name: "BLENDS Social Bar & Kitchen",
    status: "verified", sourceUrl: "https://danangleisure.com/events/matsuri-x-nie-x-noizay", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/nightlife/han-river-night.jpg", imageAlt: "Han River promenade in Da Nang at night",
    imageNote: "City night photo; not the venue.",
    venueType: "Bar and club dance floor", location: "49 Ngo Thi Si, My An, Ngu Hanh Son, Da Nang",
    genres: ["afro"], genreMatch: "approximate",
    genresText: "A July 2025 event post says guest DJs blend R&B, hip-hop, Amapiano and Afrobeats. Era or sub-style of R&B and hip-hop was not stated.",
    themedNights: { text: "'Matsuri' is described as a signature Friday party (July 18, 2025 post). Ask the venue whether it runs on your dates.", status: "estimated", sourceUrl: "https://danangleisure.com/events/matsuri-x-nie-x-noizay" },
    dressCode: null, entryFee: null, vip: null,
    hours: { text: "Open Monday to Sunday from 6pm until late (per the 2025 event post)", status: "estimated", sourceUrl: "https://danangleisure.com/events/matsuri-x-nie-x-noizay" },
    website: "https://danangleisure.com/events/matsuri-x-nie-x-noizay", instagram: null,
    bookingLinks: [
      { kind: "inquire", via: "maps", url: "https://www.google.com/maps/search/?api=1&query=Blends+Social+Bar+%26+Kitchen+49+Ngo+Thi+Si+My+An+Da+Nang", check: "fetched", checkedDate: "2026-11-02", note: "No online booking page was found. Call or message the venue from its Google Maps listing to reserve." }
    ],
    mapQuery: "Blends Social Bar & Kitchen, 49 Ngo Thi Si, My An, Da Nang",
    note: "Friday party nights are the venue\u0027s signature; ask which resident DJs are playing on Nov 26."
  },
  {
    id: "night-sky36-danang", city: "Da Nang", name: "SKY36 (Novotel Danang Premier Han River)",
    status: "verified", sourceUrl: "https://sky36.vn/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hero/dragon-bridge-night.jpg", imageAlt: "Da Nang skyline and Dragon Bridge at night",
    imageNote: "City night photo; not the venue.",
    venueType: "Rooftop club and lounge", location: "35th to 37th floors, Novotel Danang Premier Han River, 36 Bach Dang",
    genres: ["trap", "rnb-90s2000s"], genreMatch: "approximate",
    genresText: "City tourism page lists Hip-Hop, EDM and R&B. Eras not stated.",
    themedNights: { text: "Official site lists a DJ set every night 21:00 to 01:30 and a stage event slot 21:30 to 00:00 (shows include Dance Showcase and Fire Dance).", status: "verified", sourceUrl: "https://sky36.vn/" },
    dressCode: { text: "Smart casual", status: "estimated", sourceUrl: "https://danangfantasticity.com/en/sky-bar-36/" },
    entryFee: null, vip: "VIP areas seating up to 10 people (The Rooftop Guide). Ask the venue for table options.",
    hours: { text: "Open daily 18:00 to 02:00", status: "verified", sourceUrl: "https://sky36.vn/" },
    ageLimit: "18+ (listed)",
    website: "https://sky36.vn/", instagram: null,
    bookingLinks: [
      { kind: "inquire", via: "official", url: "https://sky36.vn/", check: "fetched", checkedDate: "2026-11-02", note: "Official SKY36 site. A phone number of +84 901 151 536 is listed by Way To Vietnam; the hotel front desk can also pass on a table request." },
      { kind: "inquire", via: "official", url: "https://all.accor.com/hotel/8287/index.en.shtml", check: "fetched", checkedDate: "2026-11-02", note: "Novotel Danang Premier Han River hotel page on the Accor site." }
    ],
    mapQuery: "SKY36 Novotel Danang Premier Han River, 36 Bach Dang, Da Nang",
    note: "Hours and shows are from the venue\u0027s own site. Nov 24 onward the trip is in Ho Chi Minh City, so this fits Nov 21 to 23."
  },
  {
    id: "night-weeknd-sgn", city: "Ho Chi Minh City", name: "Weeknd SGN",
    status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/nightlife/nguyen-hue-night.jpg", imageAlt: "Nguyen Hue Walking Street lit up at night",
    imageNote: "Street photo about 3 minutes' walk from the club; not the venue.",
    venueType: "Hip-hop club, about 300 capacity", location: "66 Huynh Thuc Khang, central Ho Chi Minh City, about 3 minutes' walk from Nguyen Hue",
    genres: ["trap", "rnb-90s2000s"], genreMatch: "approximate",
    genresText: "A 2026 guide lists hip-hop and R&B. Eras not stated.",
    themedNights: null,
    dressCode: null,
    entryFee: null,
    tableInfo: { text: "Guide reports standard-sofa packages from about VND 6 million before VAT and service charge. Confirm with the club.", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    vip: "Table service model; reserve through the club.",
    hours: { text: "Friday to Sunday, 22:00 to 05:00 (guide). Nov 28, 2027 is a Sunday.", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    website: null, instagram: null,
    bookingLinks: [
      { kind: "inquire", via: "maps", url: "https://www.google.com/maps/search/?api=1&query=Weeknd+SGN+66+Huynh+Thuc+Khang+Ho+Chi+Minh+City", check: "fetched", checkedDate: "2026-11-02", note: "No official booking page was found. Table packages are arranged by phone or message from its Google Maps listing." }
    ],
    mapQuery: "Weeknd SGN, 66 Huynh Thuc Khang, Ho Chi Minh City",
    note: "Hours and table prices come from a dated third-party guide. Ask the club to confirm both when you reserve."
  },
  {
    id: "night-loco-complex", city: "Ho Chi Minh City", name: "LOCO Complex",
    status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/nightlife/saigon-night-2015.jpg", imageAlt: "Ho Chi Minh City streets and towers at night",
    imageNote: "City night photo; not the venue.",
    venueType: "Two-floor club, about 300 capacity", location: "11 Nam Quoc Cang, Ben Thanh Ward, central Ho Chi Minh City",
    genres: ["trap", "rnb-90s2000s"], genreMatch: "approximate",
    genresText: "Guide: first floor hip-hop and R&B; upstairs Heatroom Top 40, EDM and House.",
    themedNights: null, dressCode: null, entryFee: null,
    tableInfo: { text: "Guide reports table minimums from about VND 3.5 million, excluding VAT and service charge. Confirm with the club.", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    vip: "Table-oriented; VIP zones exist per the guide.",
    hours: { text: "Tuesday to Sunday, 22:00 to 05:00 (guide)", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    website: null, instagram: null,
    bookingLinks: [
      { kind: "reserve", via: "ota", otaName: "Saigon Parties", url: "https://saigonparties.com/", check: "fetched", checkedDate: "2026-11-02", note: "Third-party table-booking site; it lists LOCO Complex Heatroom (second floor, 10 PM to 4 AM) with tables from 3,000,000 to 40,000,000 VND." },
      { kind: "inquire", via: "social", socialName: "TikTok", url: "https://www.tiktok.com/@lococomplex_booking", check: "unverified-by-bot", checkedDate: "2026-11-02", note: "LOCO Complex booking account on TikTok." }
    ],
    mapQuery: "LOCO Complex, 11 Nam Quoc Cang, Ho Chi Minh City",
    note: "Neighborhood Saigon is on Floor 1 of the same building (11 Nam Quoc Cang), so one stop covers two rooms."
  },
  {
    id: "night-cur8-saigon", city: "Ho Chi Minh City", name: "CUR8 Saigon",
    status: "verified", sourceUrl: "https://www.cur8sgn.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hero/saigon-night.jpg", imageAlt: "Ho Chi Minh City skyline at night",
    imageNote: "City night photo; not the venue.",
    venueType: "Caf\u00e9 bar, listening room and record shop", location: "49 Pho Duc Chinh, Ben Thanh, Ho Chi Minh City, a few steps from Ben Thanh Market",
    genres: ["trap", "neosoul"], genreMatch: "approximate",
    genresText: "Official site lists a weekly hip-hop night (Friday) and live music nights (Wednesday). Recent bookings were billed as Hip-Hop and R&B, and R&B, Neo-Soul and Funk. Sub-styles and eras vary by act.",
    themedNights: { text: "Weekly pattern on the official site: Wednesday live music 9pm to 11pm; Friday hip-hop night 10pm to late; Saturday house night 10pm to late. Nov 26, 2027 is a Friday. Specific acts for 2027 are announced closer to the date.", status: "verified", sourceUrl: "https://www.cur8sgn.com/" },
    dressCode: null,
    entryFee: { text: "Wednesday live music was listed as free entry on Eventbrite. No cover charge is published for other nights.", status: "estimated", sourceUrl: "https://www.eventbrite.com/d/vietnam/music-concerts/" },
    vip: null,
    hours: { text: "Tuesday to Sunday, 9am until late; closed Monday", status: "verified", sourceUrl: "https://www.cur8sgn.com/private-hire" },
    website: "https://www.cur8sgn.com/", instagram: "https://www.instagram.com/cur8.sgn/",
    bookingLinks: [
      { kind: "inquire", via: "official", url: "https://www.cur8sgn.com/private-hire", check: "fetched", checkedDate: "2026-11-02", note: "Official enquiry page. Phone 0974 055 548, email misinfo@cur8sgn.com. Sound Lab seats 30 to 40 guests, so a group booking is worth asking about." }
    ],
    mapQuery: "CUR8 Saigon, 49 Pho Duc Chinh, Ben Thanh, Ho Chi Minh City",
    note: "Best fit for the R&B, hip-hop and neo-soul brief; also serves coffee, cocktails and comfort bites."
  },  {
    id: "night-neighborhood-saigon", city: "Ho Chi Minh City", name: "Neighborhood Saigon",
    status: "verified", sourceUrl: "https://neighborhoodsaigon.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/nightlife/nguyen-hue-night.jpg", imageAlt: "Nguyen Hue Walking Street at night",
    imageNote: "Street photo; not the venue.",
    venueType: "American-style house-party club", location: "Floor 1, 11 Nam Quoc Cang, Pham Ngu Lao Ward, District 1 (same building as LOCO Complex)",
    genres: ["trap", "rnb-90s2000s", "afro"], genreMatch: "approximate",
    genresText: "Venue site lists hip-hop, R&B, pop and Top 40, plus Afro House, Amapiano and Afrobeats. Eras are not stated and the line-up changes nightly.",
    themedNights: null,
    dressCode: { text: "Smart casual; no flip-flops or sportswear.", status: "verified", sourceUrl: "https://neighborhoodsaigon.com/" },
    entryFee: null,
    vip: "VIP booths are free to book with no prepayment and are held until 11:30 PM. Birthdays get a name drop on the mic around midnight.",
    hours: { text: "Tuesday to Sunday, 10:00 PM to 4:00 AM; closed Monday", status: "verified", sourceUrl: "https://neighborhoodsaigon.com/" },
    ageLimit: "18+ only; bring photo ID",
    website: "https://neighborhoodsaigon.com/", instagram: null,
    bookingLinks: [
      { kind: "reserve", via: "official", url: "https://neighborhoodsaigon.com/", check: "fetched", checkedDate: "2026-11-02", note: "Booking form on the venue\u0027s site (name, phone, date, time, party size). The team calls back to confirm." },
      { kind: "inquire", via: "chat", chatName: "WhatsApp or Zalo", url: "https://wa.me/84905806518", check: "unverified-by-bot", checkedDate: "2026-11-02", note: "Hotline 0905 806 518, also on Zalo." }
    ],
    mapQuery: "Neighborhood Club, 11 Nam Quoc Cang, Pham Ngu Lao, District 1, Ho Chi Minh City",
    note: "A good birthday-night option: Nov 28, 2027 is a Sunday and the club is open."
  },  {
    id: "night-bam-bam", city: "Ho Chi Minh City", name: "Bam Bam Tropical Club",
    status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/nightlife/saigon-night-2015.jpg", imageAlt: "Ho Chi Minh City at night",
    imageNote: "City night photo; not the venue.",
    venueType: "Hip-hop club", location: "41-43 Nam Ky Khoi Nghia, central Ho Chi Minh City, about 7 minutes' walk from Ben Thanh Market",
    genres: ["trap"], genreMatch: "approximate", genresText: "Guide: hip-hop and current commercial tracks.",
    themedNights: { text: "Guide mentions recurring themed nights without naming them; ask the club which night suits you.", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    dressCode: { text: "Smart casual; no flip-flops or sports shorts (guide)", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    entryFee: null, vip: "Sofas and VIP areas per the guide.",
    hours: { text: "19:00 to 02:00 nightly (guide)", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    website: null, instagram: null,
    bookingLinks: [
      { kind: "reserve", via: "ota", otaName: "Saigon Parties", url: "https://saigonparties.com/", check: "fetched", checkedDate: "2026-11-02", note: "Third-party table-booking site that lists Bam Bam (hip-hop and R&B, about 150 capacity). A venue phone of +84 93 709 90 33 appears on a Mapstr listing." }
    ],
    mapQuery: "Bam Bam Tropical Club, 41-43 Nam Ky Khoi Nghia, Ho Chi Minh City",
    note: "Alternative on nights when Weeknd SGN is closed."
  },
  {
    id: "night-papi-club", city: "Ho Chi Minh City", name: "PAPI Club Saigon",
    status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/nightlife/nguyen-hue-night.jpg", imageAlt: "Central Ho Chi Minh City at night",
    imageNote: "Street photo; not the venue.",
    venueType: "Upscale commercial club, about 300 capacity", location: "123 Le Loi, Ben Thanh Ward, central Ho Chi Minh City",
    genres: ["trap"], genreMatch: "approximate", genresText: "Guide: hip-hop, EDM and House.",
    themedNights: null,
    dressCode: { text: "Smart elegant; avoid shorts, tank tops and flip-flops (guide)", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    entryFee: null, vip: "Table tiers; confirm minimum spend, VAT and service charge before agreeing.",
    hours: { text: "22:00 to 04:00 daily (guide)", status: "estimated", sourceUrl: "https://www.vietnamparadisetravel.com/blog/best-night-clubs-in-ho-chi-minh-city-for-tourists" },
    website: "https://thepapisaigon.com/", instagram: null,
    bookingLinks: [
      { kind: "reserve", via: "official", url: "https://thepapisaigon.com/reservations", check: "fetched", checkedDate: "2026-11-02", note: "Official reservation form (VIP, bar and social seating). The venue confirms by phone; address on the site is 123 Le Loi." }
    ],
    mapQuery: "PAPI Club Saigon, 123 Le Loi, Ho Chi Minh City",
    note: "Central option near Ben Thanh."
  }
];

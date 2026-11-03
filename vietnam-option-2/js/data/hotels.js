window.VO2_DATA = window.VO2_DATA || {};
// Hotels. Ho Chi Minh City: budget cap USD 170 per room per night.
// Da Nang: only hotels verified as directly beachfront AND upscale are listed. The USD 170 cap is a SOFT cap there:
// a Da Nang hotel above USD 170 stays as an option, labelled as a shared-room option (rate / 2 guests per person).
// rate.planningUsd for Da Nang is a researched, dated observation (see rate.note), NOT a quote or availability check.
// Ho Chi Minh City rates are unchanged proposed planning figures.
// Nights: Da Nang 3 (Nov 21-24), Ho Chi Minh City 5 (Nov 24-29).
// Photos show the area/neighbourhood (licensed Commons photos), not the hotel itself, unless stated.
window.VO2_DATA.hotelsMeta = {
  capUsdPerNight: 170,
  softCapCities: ["Da Nang"],
  sharedRoom: { guests: 2, label: "Over $170 budget \u2014 share a room to split the cost" },
  nights: { "Da Nang": 3, "Ho Chi Minh City": 5 },
  rateNote: "Da Nang rates are real observations from KAYAK on 2026-11-02 (see each card), not quotes for November 2027. Ho Chi Minh City rates are planning estimates under the USD 170 cap. Confirm every rate with the hotel before booking.",
  checkedDate: "2026-11-02"
};
window.VO2_DATA.hotels = [
  {
    id: "hotel-hyatt-regency-danang", city: "Da Nang", name: "Hyatt Regency Danang Resort and Spa",
    status: "estimated", sourceUrl: "https://www.hyatt.com/hyatt-regency/en-US/danhr-hyatt-regency-danang-resort-and-spa", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hotels/my-khe-coastline.jpg",
    imageAlt: "The Da Nang coastline with sand and sea",
    imageNote: "Coastline photo for context; not this resort.",
    stars: 5, starsStatus: "reported", starsSource: "https://www.kayak.com/Da-Nang-Hotels-Hyatt-Regency-Danang-Resort-and-Spa.419224.ksp",
    starsNote: "5-star per KAYAK's listing; the Hyatt page does not state a star count.",
    address: "5 Truong Sa Street, Hoa Hai Ward, Ngu Hanh Son, Da Nang", neighborhood: "Non Nuoc Beach (south of the city)", beachfront: true, district1: false,
    beachfrontNote: "Hyatt says the resort sits on a stretch of white sand Non Nuoc beach; Hotels.com says it sits directly on a private white sand beach; KAYAK lists a private beach. Checked 2026-11-02.",
    beachfrontSourceUrl: "https://www.hyatt.com/hyatt-regency/en-US/danhr-hyatt-regency-danang-resort-and-spa",
    amenities: ["Private beach", "Five pools including an infinity pool", "Spa", "Three restaurants", "Bar and lounge"],
    pool: true, spa: true,
    amenitiesSource: "https://www.hotels.com/ho392256/hyatt-regency-danang-resort-and-spa-da-nang-vietnam/",
    distances: [
      { to: "Marble Mountains", value: "About 0.6 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Hyatt-Regency-Danang-Resort-and-Spa.419224.ksp" },
      { to: "Da Nang airport (DAD)", value: "About 4.8 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Hyatt-Regency-Danang-Resort-and-Spa.419224.ksp" }
    ],
    rate: { planningUsd: 151, status: "estimated", note: "Lowest room price booked through KAYAK in the 2 weeks before 2026-11-02 (KAYAK page read 2026-11-02; KAYAK also showed $184 as the highest). Late-2026 observation, not a quote for November 2027." },
    review: { score: 8.7, scale: 10, basis: "KAYAK rating from 3,192 verified ratings", source: "KAYAK", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Hyatt-Regency-Danang-Resort-and-Spa.419224.ksp", date: "2026-11-02", status: "verified" },
    officialUrl: "https://www.hyatt.com/hyatt-regency/en-US/danhr-hyatt-regency-danang-resort-and-spa", bookingUrl: null,
    bookingLinks: [
      { kind: "book", via: "official", url: "https://www.hyatt.com/hyatt-regency/en-US/danhr-hyatt-regency-danang-resort-and-spa", check: "search-result", checkedDate: "2026-11-02", note: "Official Hyatt page for this resort. Enter the Nov 21-24, 2027 dates there." }
    ]
  },
  {
    id: "hotel-pullman-danang-beach", city: "Da Nang", name: "Pullman Danang Beach Resort",
    status: "estimated", sourceUrl: "https://www.pullman-danang.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hotels/my-khe-coastline.jpg",
    imageAlt: "The Da Nang coastline with sand and sea",
    imageNote: "Coastline photo for context; not this resort.",
    stars: 5, starsStatus: "verified", starsSource: "https://meetings.accor.com/hotel/8838/index.en.shtml",
    starsNote: "Accor's own page describes 5-star services and facilities.",
    address: "101 Vo Nguyen Giap Street, Ngu Hanh Son Ward, Da Nang", neighborhood: "Bac My An Beach", beachfront: true, district1: false,
    beachfrontNote: "The resort's own site says it is on the white sands of Bac My An Beach; Accor's Dutch page says directly on the beach; Expedia says it sits directly on the sand. Checked 2026-11-02.",
    beachfrontSourceUrl: "https://www.pullman-danang.com/",
    amenities: ["Private beach", "Infinity pool", "The Nang Spa", "Two restaurants", "Sauna and jacuzzi", "Fitness centre"],
    pool: true, spa: true,
    amenitiesSource: "https://meetings.accor.com/hotel/8838/index.en.shtml",
    distances: [
      { to: "Da Nang city centre", value: "About 2.5 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Pullman-Danang-Beach-Resort.399727.ksp" },
      { to: "Marble Mountains", value: "About 2.6 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Pullman-Danang-Beach-Resort.399727.ksp" },
      { to: "Da Nang airport (DAD)", value: "About 3.3 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Pullman-Danang-Beach-Resort.399727.ksp" }
    ],
    rate: { planningUsd: 128, status: "estimated", note: "Lowest room price booked through KAYAK in the 2 weeks before 2026-11-02 (KAYAK page read 2026-11-02; KAYAK also showed $205 as the highest). Late-2026 observation, not a quote for November 2027." },
    review: { score: 9.0, scale: 10, basis: "KAYAK rating from 1,822 verified ratings", source: "KAYAK", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Pullman-Danang-Beach-Resort.399727.ksp", date: "2026-11-02", status: "verified" },
    officialUrl: "https://www.pullman-danang.com/", bookingUrl: null,
    bookingLinks: [
      { kind: "book", via: "official", url: "https://www.pullman-danang.com/", check: "search-result", checkedDate: "2026-11-02", note: "Official resort site. Enter the Nov 21-24, 2027 dates there." }
    ]
  },
  {
    id: "hotel-sheraton-grand-danang", city: "Da Nang", name: "Sheraton Grand Danang Beach Resort & Spa",
    status: "estimated", sourceUrl: "https://www.marriott.com/en-us/hotels/dadsi-sheraton-grand-danang-beach-resort-and-spa/overview/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hotels/my-khe-coastline.jpg",
    imageAlt: "The Da Nang coastline with sand and sea",
    imageNote: "Coastline photo for context; not this resort.",
    stars: 5, starsStatus: "reported", starsSource: "https://sheratongranddanang.5starhotels.in/",
    starsNote: "5-star per a booking aggregator and the Da Nang tourism portal; Marriott calls it a luxury beachfront hotel.",
    address: "35 Truong Sa Street, Ngu Hanh Son Ward, Da Nang", neighborhood: "Non Nuoc Beach (south of the city)", beachfront: true, district1: false,
    beachfrontNote: "Marriott says the resort is perched on Non-Nuoc Beach and calls it a luxury beachfront hotel; KAYAK and Hotels.com list a private beach. Checked 2026-11-02.",
    beachfrontSourceUrl: "https://www.marriott.com/en-us/hotels/dadsi-sheraton-grand-danang-beach-resort-and-spa/overview/",
    amenities: ["Private beach", "Infinity pool and water slide", "Spa and steam room", "Kids club", "Water sports"],
    pool: true, spa: true,
    amenitiesSource: "https://www.kayak.com/Da-Nang-Hotels-Sheraton-Grand-Danang-Resort.3602259.ksp",
    distances: [
      { to: "Marble Mountains", value: "About 1.8 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Sheraton-Grand-Danang-Resort.3602259.ksp" },
      { to: "Da Nang airport (DAD)", value: "About 6.7 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Sheraton-Grand-Danang-Resort.3602259.ksp" }
    ],
    rate: { planningUsd: 137, status: "estimated", note: "Lowest room price booked through KAYAK in the 2 weeks before 2026-11-02 (KAYAK page read 2026-11-02; the highest shown was also $137). Late-2026 observation, not a quote for November 2027." },
    review: { score: 8.9, scale: 10, basis: "KAYAK rating from 1,105 verified ratings", source: "KAYAK", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Sheraton-Grand-Danang-Resort.3602259.ksp", date: "2026-11-02", status: "verified" },
    officialUrl: "https://www.marriott.com/en-us/hotels/dadsi-sheraton-grand-danang-beach-resort-and-spa/overview/", bookingUrl: null,
    bookingLinks: [
      { kind: "book", via: "official", url: "https://www.marriott.com/en-us/hotels/dadsi-sheraton-grand-danang-beach-resort-and-spa/overview/", check: "search-result", checkedDate: "2026-11-02", note: "Official Marriott page for this resort. Enter the Nov 21-24, 2027 dates there." }
    ]
  },
  {
    id: "hotel-fusion-resort-danang", city: "Da Nang", name: "Fusion Resort & Villas Da Nang",
    status: "estimated", sourceUrl: "https://fusionresorts.com/danang/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hotels/my-khe-coastline.jpg",
    imageAlt: "The Da Nang coastline with sand and sea",
    imageNote: "Coastline photo for context; not this resort.",
    stars: 5, starsStatus: "reported", starsSource: "https://fusionandvillas.5starhotels.in/",
    starsNote: "5-star per booking aggregator listings; the official Fusion page does not state a star class.",
    address: "Truong Sa Street, Ngu Hanh Son Ward, Da Nang", neighborhood: "Non Nuoc coast (south of the city)", beachfront: true, district1: false,
    beachfrontNote: "Fusion's site places the resort on the coastline between central Da Nang and Hoi An; KAYAK describes a private white sand beach; Expedia says the resort sits on a bluff looking out over Non Nuoc Beach. Checked 2026-11-02.",
    beachfrontSourceUrl: "https://fusionresorts.com/danang/",
    amenities: ["Wellness-inclusive concept (per official site)", "Spa (Maia Spa)", "Daily yoga and meditation classes", "Private beach", "Outdoor pool", "Two restaurants"],
    pool: true, spa: true,
    amenitiesSource: "https://www.kayak.com/Da-Nang-Hotels-Fusion-Resort-and-Villas-Da-Nang.9260634.ksp",
    distances: [
      { to: "Marble Mountains", value: "About 2.5 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Fusion-Resort-and-Villas-Da-Nang.9260634.ksp" },
      { to: "Da Nang airport (DAD)", value: "About 7.4 mi (KAYAK listing)", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Fusion-Resort-and-Villas-Da-Nang.9260634.ksp" }
    ],
    rate: { planningUsd: 227, status: "estimated", note: "Lowest room price booked through KAYAK in the 2 weeks before 2026-11-02 (KAYAK page read 2026-11-02; KAYAK also showed $303 as the highest). Late-2026 observation, not a quote for November 2027." },
    review: { score: 9.6, scale: 10, basis: "KAYAK rating from 373 verified ratings", source: "KAYAK", sourceUrl: "https://www.kayak.com/Da-Nang-Hotels-Fusion-Resort-and-Villas-Da-Nang.9260634.ksp", date: "2026-11-02", status: "verified" },
    officialUrl: "https://fusionresorts.com/danang/", bookingUrl: null,
    bookingLinks: [
      { kind: "book", via: "official", url: "https://villasdanang.backhotelite.com/en/bookcore/availability/fhrvdang/2027-11-21/2027-11-24/", check: "fetched", checkedDate: "2026-11-02", datesIncluded: "2027-11-21 to 2027-11-24", note: "Booking engine linked from the official Fusion page. The date path format was confirmed from the engine's own redirect; it responded for the 2027 dates, but availability must be checked there." },
      { kind: "inquire", via: "official", url: "https://fusionresorts.com/danang/contact/", check: "fetched", checkedDate: "2026-11-02" }
    ]
  },
  {
    id: "hotel-la-siesta-premium", city: "Ho Chi Minh City", name: "La Siesta Premium Saigon",
    status: "verified", sourceUrl: "https://lasiestapremiumsaigon.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hotels/ly-tu-trong.jpg",
    imageAlt: "Ly Tu Trong street near Dong Khoi in central Ho Chi Minh City",
    imageNote: "Street photo from the hotel's neighbourhood; not the hotel.",
    stars: 5, starsStatus: "verified", starsSource: "https://lasiestapremiumsaigon.com/",
    starsNote: "The hotel's own site calls it a 5-star hotel.",
    address: "180-188 Ly Tu Trong, District 1", neighborhood: "District 1 (near Ben Thanh and Dong Khoi)", beachfront: false, district1: true,
    amenities: ["Twilight Sky Bar", "Cloud Nine restaurant", "La Spa Saigon", "Rooftop pool (per aggregator listings)", "Airport shuttle (per Hotels.com)"],
    pool: true, spa: true,
    amenitiesSource: "https://lasiestapremiumsaigon.com/",
    distances: [
      { to: "Takashimaya Vietnam", value: "Listed as a nearby point of interest", sourceUrl: "https://www.booking.com/hotel/vn/la-siesta-premium-sai-gon.html" },
      { to: "Ben Thanh Market", value: null, sourceUrl: null },
      { to: "Tan Son Nhat Airport", value: "About 7.2 km (4.5 miles)", sourceUrl: "https://zh.hotels.com/en/ho2855095936/la-siesta-premium-sai-gon-ho-chi-minh-city-vietnam/" }
    ],
    rate: { planningUsd: 150, status: "proposed", note: "Proposed planning figure under the USD 170 cap; no live quote." },
    review: { score: null, scale: null, basis: "Named in Tripadvisor Travellers' Choice Best of the Best 2026 (top 9 hotels in Vietnam), as announced by the hotel group", source: "Tripadvisor (via the hotel group's announcement)", sourceUrl: "https://lasiestahotels.com/saigon/tripadvisor-travelers-choice-awards-best-of-the-best-2026.html", date: "2026-11-02", status: "verified" },
    officialUrl: "https://lasiestapremiumsaigon.com/", bookingUrl: null,
    bookingLinks: [
      { kind: "book", via: "ota", otaName: "Booking.com", url: "https://www.booking.com/hotel/vn/la-siesta-premium-sai-gon.html", check: "unverified-by-bot", checkedDate: "2026-11-02", note: "Booking.com blocks automated checks. Search results show this page is La Siesta Premium Sai Gon, Ho Chi Minh City." },
      { kind: "inquire", via: "official", url: "https://lasiestapremiumsaigon.com/contact-us/", check: "fetched", checkedDate: "2026-11-02" }
    ]
  },
  {
    id: "hotel-silverland-ben-thanh", city: "Ho Chi Minh City", name: "Silverland Ben Thanh",
    status: "verified", sourceUrl: "https://silverlandhotels.com/boutique-hotel-near-ben-thanh-market/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hotels/ben-thanh-market.jpg",
    imageAlt: "Ben Thanh Market building in Ho Chi Minh City",
    imageNote: "Photo of the neighbouring Ben Thanh Market; not the hotel.",
    stars: 4, starsStatus: "verified", starsSource: "https://silverlandhotels.com/boutique-hotel-near-ben-thanh-market/",
    starsNote: "Described as a four-star boutique hotel on the group's site.",
    address: "14-16 Le Lai, Ben Thanh Ward, District 1", neighborhood: "District 1 (beside Ben Thanh Market)", beachfront: false, district1: true,
    amenities: ["Rooftop pool", "Dining spaces", "Rooftop bar (per aggregator)", "Group spa brand: KL Spa"],
    pool: true, spa: null,
    amenitiesSource: "https://silverlandhotels.com/boutique-hotel-near-ben-thanh-market/",
    distances: [
      { to: "Ben Thanh Market", value: "About a 1 minute walk", sourceUrl: "https://silverlandhotels.com/boutique-hotel-near-ben-thanh-market/" },
      { to: "Notre-Dame Cathedral Basilica", value: "About 800 m", sourceUrl: "https://www.booking.com/hotel/vn/silverland-benthanh.html" }
    ],
    rate: { planningUsd: 100, status: "proposed", note: "Proposed planning figure under the USD 170 cap; no live quote." },
    review: null,
    officialUrl: "https://silverlandhotels.com/", bookingUrl: null,
    bookingLinks: [
      { kind: "book", via: "ota", otaName: "Booking.com", url: "https://www.booking.com/hotel/vn/silverland-benthanh.html", check: "unverified-by-bot", checkedDate: "2026-11-02", note: "Booking.com blocks automated checks. Search results show this page is Silverland Ben Thanh, 1 minute from Ben Thanh Market. The group's own booking engine searches several Silverland hotels, so it is not linked." },
      { kind: "inquire", via: "official", url: "https://silverlandhotels.com/contact-us", check: "fetched", checkedDate: "2026-11-02", note: "Silverland group contact page; name the Ben Thanh hotel in the message." }
    ],
    roomNote: "Official room list shows some categories (for example Spring Field) have no window. Choose a room with daylight."
  },
  {
    id: "hotel-liberty-central-citypoint", city: "Ho Chi Minh City", name: "Liberty Central Saigon Citypoint",
    status: "verified", sourceUrl: "https://www.libertycentralsaigoncitypoint.com", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/general/city-hall.jpg",
    imageAlt: "Ho Chi Minh City Hall, a central landmark in District 1",
    imageNote: "Photo of a nearby landmark; not the hotel.",
    stars: 4, starsStatus: "reported", starsSource: "https://liberty-central-saigon-citypoint.hochiminhhotels.com/",
    starsNote: "4-star per travel listings; official site does not state it in the text checked.",
    address: "Pasteur Street, District 1", neighborhood: "District 1", beachfront: false, district1: true,
    amenities: ["171 rooms and suites", "Infinity rooftop pool", "The Spa", "Above Sky Bar", "Restaurant"],
    pool: true, spa: true,
    amenitiesSource: "https://www.libertycentralsaigoncitypoint.com",
    distances: [
      { to: "Bitexco Financial Tower", value: "About 650 m", sourceUrl: "https://liberty-central-saigon-citypoint.ho-chi-minh-city-hotels.com/" },
      { to: "Ben Thanh Market", value: "Short walk (listing)", sourceUrl: "https://www.kayak.com/Ho-Chi-Minh-City-Hotels-Liberty-Central-Saigon-Citypoint.2180189.ksp" }
    ],
    rate: { planningUsd: 90, status: "proposed", note: "Proposed planning figure under the USD 170 cap; no live quote." },
    review: { score: 8.7, scale: 10, basis: "Booking.com score quoted by a third-party listing; may be out of date", source: "Booking.com (secondary listing)", sourceUrl: "https://libertycentralhochiminhcity.ohotel.com/", date: "2019-10-20", status: "estimated" },
    officialUrl: "https://www.libertycentralsaigoncitypoint.com", bookingUrl: null,
    bookingLinks: [
      { kind: "book", via: "official", url: "https://secure.odysseahotels.com/Booking-Engine/c98fb2a8-f837-4957-acca-4d61da20e3f3/", check: "fetched", checkedDate: "2026-11-02", note: "Booking engine linked from the hotel's official site. It is a script-driven page, so the property name was not read by the checker. No date parameters are known to work, so none are added." },
      { kind: "book", via: "ota", otaName: "Booking.com", url: "https://www.booking.com/hotel/vn/liberty-central-saigon-city-point.html", check: "unverified-by-bot", checkedDate: "2026-11-02", note: "Booking.com blocks automated checks. Search results show this page is Liberty Central Saigon Citypoint." },
      { kind: "inquire", via: "official", url: "https://www.libertycentralsaigoncitypoint.com/en/contact-us/", check: "fetched", checkedDate: "2026-11-02" }
    ]
  }
];

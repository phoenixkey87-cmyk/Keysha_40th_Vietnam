window.VO2_DATA = window.VO2_DATA || {};
// Cafes. Opening hours are shown only where a listing gives them.
// Photos are licensed Commons images that illustrate the drink or area; they are not photos of the named cafe unless the alt text says so.
window.VO2_DATA.cafes = [
  {
    id: "cafe-apartment-42-nguyen-hue", city: "Ho Chi Minh City", name: "The Cafe Apartment, 42 Nguyen Hue",
    status: "verified", sourceUrl: "https://www.vietnamcoracle.com/the-cafe-apartment-on-saigons-walking-street/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/cafe-apartment.jpg", imageAlt: "The Cafe Apartment building on Nguyen Hue Walking Street, Ho Chi Minh City",
    imageNote: null,
    neighborhood: "District 1, Nguyen Hue Walking Street", type: ["cafe-building", "rooftop-views", "shopping"],
    signature: ["Independent specialty cafes", "Tea rooms", "Boutique shops"],
    atmosphere: "A crumbling nine-storey 1960s apartment block turned into a vertical collection of independent cafes, fashion boutiques, bars and coworking spaces.",
    hours: null, route: "hcmc", routeOrder: 1,
    mapQuery: "42 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh City", note: "Individual tenants change often; check which cafes are open on the day."
  },
  {
    id: "cafe-the-workshop", city: "Ho Chi Minh City", name: "The Workshop Coffee",
    status: "estimated", sourceUrl: "https://newasiatours.com/best-cafe-in-saigon.html", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/garden-cafe.jpg", imageAlt: "A garden-style cafe in Ho Chi Minh City with plants and seating",
    imageNote: "Illustrative Ho Chi Minh City cafe photo (Cafe Loi Xua); not The Workshop.",
    neighborhood: "District 1", type: ["specialty-coffee", "loft"],
    signature: ["Pour-over", "Siphon", "Cold brew"],
    atmosphere: "Loft-style space with natural light, known for serious specialty coffee (travel guide description).",
    hours: null, route: "hcmc", routeOrder: 2,
    mapQuery: "The Workshop Coffee, 27 Ngo Duc Ke, Ho Chi Minh City", note: "Also recommended by The New York Times in a list reported by VnExpress."
  },
  {
    id: "cafe-cong-caphe-yersin", city: "Ho Chi Minh City", name: "Cong Ca Phe (Yersin)",
    status: "estimated", sourceUrl: "https://gtrip.vn/travel-blogs/best-coffee-in-saigon", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/ca-phe-sua-da.jpg", imageAlt: "Vietnamese iced milk coffee, ca phe sua da",
    imageNote: "Illustrative drink photo; not a Cong Ca Phe photo.",
    neighborhood: "93 Yersin, former District 1", type: ["coconut-coffee", "retro"],
    signature: ["Coconut coffee"],
    atmosphere: "Retro Vietnamese decor; the chain is known for coconut coffee.",
    hours: null, route: "hcmc", routeOrder: 3,
    mapQuery: "Cong Ca Phe, 93 Yersin, Ho Chi Minh City", note: "A chain, so other branches are easy to find."
  },
  {
    id: "cafe-little-hanoi-egg-coffee", city: "Ho Chi Minh City", name: "Little Hanoi Egg Coffee",
    status: "estimated", sourceUrl: "https://e.vnexpress.net/news/places/new-york-times-recommends-hcmcs-finest-cafes-4721076.html", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/egg-coffee.jpg", imageAlt: "A cup of Vietnamese egg coffee with creamy foam",
    imageNote: "Egg coffee originates in Hanoi; this is an illustrative drink photo.",
    neighborhood: "119/5 Yersin, Pham Ngu Lao Ward, District 1", type: ["egg-coffee"],
    signature: ["Egg coffee"],
    atmosphere: "Named in a list of Ho Chi Minh City cafes recommended by The New York Times (as reported by VnExpress).",
    hours: { text: "8:00 to 22:00 (4travel listing)", sourceUrl: "https://4travel.jp/os_shisetsu/10634719" }, route: null, routeOrder: null,
    mapQuery: "Little HaNoi Egg Coffee 119/5 Yersin Pham Ngu Lao District 1 Ho Chi Minh City", note: "Down an alley off Yersin street, about 5 minutes on foot from Ben Thanh Market (Trip.com traveller post). A second branch is at 212 Le Lai."
  },
  {
    id: "cafe-xliii-danang", city: "Da Nang", name: "XLIII Specialty Coffee (43 Factory Coffee Roaster)",
    status: "estimated", sourceUrl: "https://travelness.com/best-cafes-in-da-nang", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/danang-cafe-phin.jpg", imageAlt: "A Vietnamese phin coffee cafe in Da Nang",
    imageNote: "Illustrative Da Nang cafe photo; not XLIII.",
    neighborhood: "Lot 422 Ngo Thi Si, Ngu Hanh Son", type: ["specialty-coffee", "roaster"],
    signature: ["Specialty single-origin coffee"],
    atmosphere: "Celebrated among specialty coffee fans; the roaster was renamed XLIII per Da Nang guides.",
    hours: null, route: "danang", routeOrder: 1,
    mapQuery: "XLIII Coffee Lot 422 Ngo Thi Si Ngu Hanh Son Da Nang", note: "Address from the roaster\u0027s own site (xliiicoffee.com). Open-plan glass-fronted shop near the beach."
  },
  {
    id: "cafe-a-la-carte-danang", city: "Da Nang", name: "A La Carte rooftop cafe",
    status: "estimated", sourceUrl: "https://mytour.vn/en/blog/bai-viet/explore-da-nang-coffee-discover-now-21-amazing-coffee-spots-for-the-virtual-living-enthusiasts.html", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/long-beach-coffee.jpg", imageAlt: "A beachside coffee bar in Da Nang",
    imageNote: "Illustrative Da Nang cafe photo; not A La Carte.",
    neighborhood: "My Khe Beach", type: ["rooftop", "beach-views"],
    signature: ["Coffee with My Khe Beach views"],
    atmosphere: "Top floor of the A La Carte hotel with panoramic views of My Khe Beach (guide description).",
    hours: { text: "Rooftop bar listed 6:00 PM to 11:00 PM", sourceUrl: "https://danangfantasticity.com/en/la-carte-rooftop-bar" }, route: "danang", routeOrder: 2,
    mapQuery: "A La Carte Danang Beach rooftop cafe, Da Nang", note: "Rooftop of the A La Carte Da Nang Beach hotel, 200 Vo Nguyen Giap; listed as a public rooftop bar on the Da Nang tourism portal."
  },
  {
    id: "cafe-hoi-an-ancient-town", city: "Da Nang", name: "Hoi An cafes (optional day-trip idea)",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/hoi-an-cafe.jpg", imageAlt: "A cafe in Hoi An, Vietnam",
    imageNote: "Photo of a Hoi An cafe (Cafe 96).",
    neighborhood: "Hoi An (south of Da Nang)", type: ["garden", "heritage"],
    signature: ["Coffee in heritage buildings"],
    atmosphere: "Optional extra; not in the base itinerary.",
    hours: null, route: null, routeOrder: null,
    mapQuery: "Hoi An Ancient Town cafes", note: "Optional idea only; not part of the base plan. XLIII Coffee also has a Hoi An shop at 326 Ly Thuong Kiet."
  }
];
window.VO2_DATA.cafeRoutes = [
  { id: "danang", city: "Da Nang", title: "Da Nang cafe hopping route (proposed)", steps: ["cafe-xliii-danang", "cafe-a-la-carte-danang"], note: "Start with specialty coffee, then end with beach views. Pair with Han Market and the Marble Mountains on Nov 22." },
  { id: "hcmc", city: "Ho Chi Minh City", title: "Ho Chi Minh City cafe hopping route (proposed)", steps: ["cafe-apartment-42-nguyen-hue", "cafe-the-workshop", "cafe-cong-caphe-yersin"], note: "Morning at 42 Nguyen Hue, then specialty coffee, then coconut coffee. Egg coffee at Little Hanoi Egg Coffee is an optional detour." }
];

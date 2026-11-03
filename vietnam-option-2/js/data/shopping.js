window.VO2_DATA = window.VO2_DATA || {};
// Shopping. Prices are null: no verified price ranges. Payment tips are general guidance, not venue-verified.
window.VO2_DATA.shopping = [
  {
    id: "shop-saigon-centre-takashimaya", city: "Ho Chi Minh City", name: "Saigon Centre and Takashimaya Vietnam",
    status: "estimated", sourceUrl: "https://scootersaigonadventure.com/takashimaya-shopping-center-saigon-centre-shopping-mall/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/shopping/dong-khoi.jpg", imageAlt: "Central Ho Chi Minh City street near Dong Khoi",
    imageNote: "Nearby street photo; not the mall.",
    neighborhood: "65 Le Loi, District 1", categories: ["fashion", "handbags", "beauty", "gifts"],
    description: "Japanese department store inside the Saigon Centre mall, with international fashion, beauty and a food hall.",
    hours: { text: "Reported Mon to Fri 9:30 to 21:30; Sat, Sun and holidays 9:30 to 22:00 (third-party guide, not official)", status: "estimated", sourceUrl: "https://scootersaigonadventure.com/takashimaya-shopping-center-saigon-centre-shopping-mall/" },
    priceRange: null, payment: "Cards are generally accepted in malls (general guidance).",
    mapQuery: "Takashimaya Saigon Centre, 65 Le Loi, Ho Chi Minh City"
  },
  {
    id: "shop-ben-thanh", city: "Ho Chi Minh City", name: "Ben Thanh Market",
    status: "estimated", sourceUrl: "https://silverlandhotels.com/boutique-hotel-near-ben-thanh-market/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/hotels/ben-thanh-market.jpg", imageAlt: "Ben Thanh Market building in Ho Chi Minh City",
    imageNote: null,
    neighborhood: "Le Loi / Le Lai, District 1", categories: ["souvenirs", "fashion", "gifts"],
    description: "Landmark covered market with souvenirs, textiles, coffee and snacks. Next to Ben Thanh metro station.",
    hours: null, priceRange: null,
    payment: "Cash in VND is the norm at stalls; bargaining is customary at markets (general guidance). Compare prices and keep small notes.",
    mapQuery: "Ben Thanh Market, Ho Chi Minh City"
  },
  {
    id: "shop-dong-khoi", city: "Ho Chi Minh City", name: "Dong Khoi Street",
    status: "estimated", sourceUrl: "https://saigon-scene.com/ho-chi-minh-city-nightlife/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/shopping/dong-khoi.jpg", imageAlt: "Dong Khoi Street in central Ho Chi Minh City",
    imageNote: null,
    neighborhood: "District 1", categories: ["fashion", "custom clothing", "gifts", "boutiques"],
    description: "The historic downtown core with boutiques, designers, hotel rooftops and cocktail bars. A good place for tailored or designer pieces.",
    hours: null, priceRange: null,
    payment: "Boutiques usually take cards; fixed prices (general guidance).",
    mapQuery: "Dong Khoi Street, Ho Chi Minh City"
  },
  {
    id: "shop-cafe-apartment", city: "Ho Chi Minh City", name: "Cafe Apartment boutiques, 42 Nguyen Hue",
    status: "verified", sourceUrl: "https://www.vietnamcoracle.com/the-cafe-apartment-on-saigons-walking-street/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/cafes/42-nguyen-hue.jpg", imageAlt: "The 42 Nguyen Hue apartment block on the walking street",
    imageNote: null,
    neighborhood: "Nguyen Hue, District 1", categories: ["fashion", "gifts", "souvenirs"],
    description: "Independent fashion boutiques and design shops share the building with cafes.",
    hours: null, priceRange: null, payment: "Varies by shop (general guidance: carry some cash and a card).",
    mapQuery: "42 Nguyen Hue, District 1, Ho Chi Minh City"
  },
  {
    id: "shop-han-market", city: "Da Nang", name: "Han Market",
    status: "estimated", sourceUrl: "https://tms-beach.hotelsdanang.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/shopping/han-market.jpg", imageAlt: "Han Market in Da Nang, Vietnam",
    imageNote: null,
    neighborhood: "Bach Dang / Hung Vuong, Hai Chau", categories: ["souvenirs", "fabric", "custom clothing", "gifts"],
    description: "Central market with fabric, clothing, food and souvenirs. Tailors nearby can make custom clothing; timelines and prices need confirming.",
    hours: null, priceRange: null,
    payment: "Mostly cash in VND; bargaining is customary (general guidance).",
    mapQuery: "Han Market, Da Nang"
  },
  {
    id: "shop-con-market", city: "Da Nang", name: "Con Market",
    status: "estimated", sourceUrl: null, checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/shopping/han-market-fabric.jpg", imageAlt: "Fabric stalls at Han Market in Da Nang",
    imageNote: "Photo of Han Market fabrics; not Con Market.",
    neighborhood: "Da Nang city centre", categories: ["local food", "gifts"],
    description: "Local market in central Da Nang for fresh food, snacks and gifts. Use the map link for the current location.",
    hours: null, priceRange: null, payment: "Cash in VND (general guidance).",
    mapQuery: "Con Market, Da Nang"
  },
  {
    id: "shop-hoi-an-tailors", city: "Da Nang", name: "Hoi An tailors (optional day-trip idea)",
    status: "proposed", sourceUrl: null, checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/shopping/hoi-an-tailor.jpg", imageAlt: "A silk tailoring shop in Hoi An",
    imageNote: "Photo of a Hoi An tailoring shop (Ants Silk).",
    neighborhood: "Hoi An", categories: ["custom clothing"],
    description: "Custom clothing is a well-known Hoi An craft. Not in the base itinerary; allow several days for fittings, which may not fit this schedule.",
    hours: null, priceRange: null, payment: "Varies by shop.",
    mapQuery: "Hoi An tailor shops"
  }
];
window.VO2_DATA.shoppingTips = [
  "Payment guidance (general, not venue-verified): carry some Vietnamese dong in small notes for markets and taxis; malls, hotels and many boutiques accept international cards.",
  "Bargaining is common at markets but not in malls or fixed-price boutiques.",
  "Ask your bank about foreign-transaction fees and notify it of travel dates.",
  "Keep valuables secured in crowded markets.",
  "Prices are not listed here because no verified price ranges were found."
];

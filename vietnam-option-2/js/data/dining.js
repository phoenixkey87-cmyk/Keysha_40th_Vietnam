window.VO2_DATA = window.VO2_DATA || {};
// Dining. Michelin status checked 2026-11-02 against the restaurant's own site / Michelin Guide listings.
// Status can change each year: re-check the current Michelin Guide Vietnam before booking.
window.VO2_DATA.dining = [
  {
    id: "dine-la-maison-1888", city: "Da Nang", name: "La Maison 1888", featured: true, proposedDate: "2027-11-23",
    status: "verified", sourceUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/general/son-tra.jpg",
    imageAlt: "Da Nang and the green Son Tra Peninsula, home of the InterContinental resort",
    imageNote: "Peninsula photo for context; not the restaurant interior.",
    cuisine: "Contemporary French, Chef Christian Le Squer",
    location: "InterContinental Danang Sun Peninsula Resort, Son Tra Peninsula",
    michelin: { status: "verified", text: "One Michelin Star listed for 2024, 2025 and 2026 on the resort's page. Re-check the current guide before booking.", sourceUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/", secondarySourceUrl: "https://en.nhandan.vn/michelin-guide-announces-viet-nams-top-restaurants-in-2025-post149076.html" },
    description: "Set in a recreated Indochine colonial mansion, with a romantic candlelit main room and a terrace.",
    hours: { text: "Daily dinner 18:30 to 21:00 (last order 20:45)", sourceUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/" },
    dressCode: { text: "Gentlemen: smart resort wear, no shorts, jacket not required. Ladies: dresses, smart skirts or trousers suggested.", sourceUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/" },
    menu: { text: "Gourmand Menu by Chef Christian Le Squer; a five-course menu was listed for a temporary venue on the resort's Heaven Level. The signature dish listed is Spaghetti Debout.", sourceUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/", notice: "The resort page notes the restaurant temporarily moved to its Heaven Level from a September 27 date. Confirm the current venue and menu when booking." },
    priceEstimate: null,
    deposit: { text: "Courtesy deposit of VND 1,000,000 per guest; cancellations after 11:00 on the day incur VND 1,000,000 per person.", sourceUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/" },
    reservationUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/",
    menuUrl: "https://www.danang.intercontinental.com/dining/la-maison-1888/",
    bookingLinks: [
      { kind: "reserve", via: "official", url: "https://www.danang.intercontinental.com/dining/la-maison-1888/", check: "fetched", checkedDate: "2026-11-02", note: "Resort dining page. It says reservations are recommended and a deposit link follows confirmation; it has no online booking form." },
      { kind: "inquire", via: "official", url: "https://www.danang.intercontinental.com/contact-us/", check: "fetched", checkedDate: "2026-11-02" }
    ],
    reservationStatus: "proposed", note: "Proposed for Nov 23, 2027, subject to reservation availability and budget. Nothing is booked."
  },
  {
    id: "dine-anan-saigon", city: "Ho Chi Minh City", name: "Ănăn Saigon", featured: true, proposedDate: "2027-11-27",
    status: "verified", sourceUrl: "https://anansaigon.com/booking/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/dining/spring-rolls.jpg",
    imageAlt: "Plate of Vietnamese fried spring rolls",
    imageNote: "Illustrative Vietnamese dish; not a photo of the restaurant.",
    cuisine: "Contemporary Vietnamese, chef-owner Peter Cuong Franklin",
    location: "89 Ton That Dam, District 1, inside the Cho Cu (old market) area",
    michelin: { status: "verified", text: "One Michelin Star since the first Vietnam guide (2023); listed among HCMC's one-star restaurants in the 2025 guide.", sourceUrl: "https://guide.michelin.com/vn/en/article/people/anan-saigon-peter-cuong-franklin-ho-chi-minh-city-s-first-and-only-michelin-star", secondarySourceUrl: "https://visithcmc.vn/a-culinary-journey-through-the-new-city-and-the-michelin-guide-2025-in-ho-chi-minh-city/" },
    description: "Modern techniques applied to Vietnamese street-food flavours in a small walk-up building in a working wet market.",
    hours: { text: "Dinner only from 5 PM, Tuesday to Sunday; closed Mondays. Nov 27, 2027 is a Saturday.", sourceUrl: "https://anansaigon.com/booking/" },
    dressCode: { text: "No dress code required (per the restaurant).", sourceUrl: "https://anansaigon.com/booking/" },
    menu: { text: "Tasting menus listed: Saigon Tasting Menu US$115 food only; Chef Peter's Tasting Menu US$145 food only. Pairings extra. Everyone at the table orders the same tasting menu. Pre-booking required for tasting menu; seatings 5:30 pm or 8:30 pm. Prices may change.", sourceUrl: "https://anansaigon.com/booking/" },
    priceEstimate: { text: "Per person from US$115 food only (listed price, 2026-11-02; re-confirm for 2027)", usdPerPerson: 115, status: "verified", sourceUrl: "https://anansaigon.com/booking/" },
    accessibility: "The restaurant states it cannot accommodate children under 12 and is not suitable for wheelchairs.",
    reservationUrl: "https://anansaigon.com/booking/",
    bookingLinks: [
      { kind: "reserve", via: "official", url: "https://anansaigon.com/booking/", check: "fetched", checkedDate: "2026-11-02", note: "Official booking page. Reservations are made by email to hello@anansaigon.com." }
    ],
    reservationEmail: "hello@anansaigon.com",
    menuUrl: "https://helloanan.my.canva.site/anan-alacarte",
    reservationStatus: "proposed", note: "Proposed for Nov 27, 2027, subject to availability. The restaurant suggests booking about 2 weeks ahead; confirm whether 2027 dates are open."
  },
  {
    id: "dine-nen-danang", city: "Da Nang", name: "Nen Danang", featured: false,
    status: "verified", sourceUrl: "https://guide.michelin.com/en/da-nang-region/da-nang_2984390/restaurant/nen-danang", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/general/da-nang-cathedral.jpg",
    imageAlt: "The pink Da Nang Cathedral",
    imageNote: "City landmark photo; not the restaurant.",
    cuisine: "Vietnamese single set menu, chef Summer Le",
    location: "16 My Da Tay 2 Street, Khue My Ward, Ngu Hanh Son, Da Nang",
    michelin: { status: "verified", text: "Michelin Green Star holder (retained in the 2025 guide per Vietnamese tourism news).", sourceUrl: "https://guide.michelin.com/en/article/sustainable-gastronomy/nen-danang-vietnams-first-michelin-green-star", secondarySourceUrl: "https://en.nhandan.vn/michelin-guide-announces-viet-nams-top-restaurants-in-2025-post149076.html" },
    description: "Minimal, modern interior with theatrical lighting; one set menu revamped every six months (per Michelin Guide).",
    hours: null, dressCode: null, menu: null, priceEstimate: null,
    reservationUrl: "https://restaurantnen.com/", menuUrl: null,
    bookingLinks: [
      { kind: "inquire", via: "official", url: "https://restaurantnen.com/", check: "fetched", checkedDate: "2026-11-02", note: "Official site of the N\u00e9n restaurant group. It has no online booking form; a phone of +84 84 714 8866 is listed by Falstaff. Reserve by phone or message." },
      { kind: "inquire", via: "official", url: "https://guide.michelin.com/en/da-nang-region/da-nang_2984390/restaurant/nen-danang", check: "fetched", checkedDate: "2026-11-02", note: "Michelin Guide listing with address and contact details." }
    ],
    reservationStatus: "proposed", note: "Alternative birthday-week dinner. One set menu, revamped every six months, so the menu on Nov 2027 dates will differ from today\u0027s."
  },
  {
    id: "dine-waterfront-danang", city: "Da Nang", name: "Waterfront Danang Restaurant & Bar", featured: false,
    status: "verified", sourceUrl: "https://waterfrontdanang.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/dining/han-river-bridge-night.jpg",
    imageAlt: "Han River bridge in Da Nang lit at night",
    imageNote: "Han River night view; not the restaurant.",
    cuisine: "International and Vietnamese",
    location: "150-152 Bach Dang, Hai Chau, on the Han River",
    michelin: null,
    description: "Two-level riverfront venue with an upstairs restaurant and downstairs bar. Relaxed rather than formal.",
    hours: { text: "Per official site: Tue to Fri 3pm to 10:30pm; Sat and Sun 11am to 10:30pm", sourceUrl: "https://waterfrontdanang.com/" },
    dressCode: null, menu: null, priceEstimate: null,
    reservationUrl: "https://waterfrontdanang.com/", menuUrl: null,
    bookingLinks: [
      { kind: "inquire", via: "official", url: "https://waterfrontdanang.com/contact/", check: "fetched", checkedDate: "2026-11-02" }
    ], reservationStatus: "proposed", note: "Casual-upscale option for cocktails and dinner by the river."
  },
  {
    id: "dine-akuna", city: "Ho Chi Minh City", name: "AKUNA", featured: false,
    status: "verified", sourceUrl: "https://akunarestaurant.com/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/dining/bitexco-sunset.jpg",
    imageAlt: "Ho Chi Minh City skyline at sunset seen from Bitexco tower",
    imageNote: "City skyline view; not the restaurant.",
    cuisine: "Contemporary tasting menu",
    location: "9F, Le Meridien Saigon, 3C Ton Duc Thang, District 1",
    michelin: { status: "verified", text: "One Michelin Star (2025 HCMC list); the restaurant's site describes itself as a 1 Michelin star restaurant.", sourceUrl: "https://akunarestaurant.com/about/", secondarySourceUrl: "https://visithcmc.vn/a-culinary-journey-through-the-new-city-and-the-michelin-guide-2025-in-ho-chi-minh-city/" },
    description: "Rule-bending fine dining with a wine programme led by a head sommelier.",
    hours: null, dressCode: null, menu: null, priceEstimate: null,
    reservationUrl: "https://akunarestaurant.com/", menuUrl: "https://akunarestaurant.com/menu/",
    bookingLinks: [
      { kind: "inquire", via: "official", url: "https://akunarestaurant.com/contact/", check: "fetched", checkedDate: "2026-11-02", note: "Official contact page with the restaurant hotline and opening hours." }
    ], reservationStatus: "proposed", note: "Michelin-starred alternative if Anan Saigon is full."
  },
  {
    id: "dine-saigon-saigon-rooftop", city: "Ho Chi Minh City", name: "Saigon Saigon Rooftop Bar (Caravelle)", featured: false,
    status: "estimated", sourceUrl: "https://saigon-scene.com/top-rooftop-bars-in-saigon/", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/dining/saigon-saigon-rooftop.jpg",
    imageAlt: "Saigon Saigon Rooftop Bar at the Caravelle Hotel with city views",
    imageNote: "Photo from 2014; the bar has since been renovated.",
    cuisine: "Cocktails and bar bites",
    location: "10th floor, Caravelle Saigon, near the Opera House",
    michelin: null,
    description: "A classic hotel rooftop for cocktails. A local guide reports it reopened on 28 September 2026 after renovation.",
    hours: null, dressCode: null, menu: null, priceEstimate: null,
    reservationUrl: null, menuUrl: null,
    bookingLinks: [
      { kind: "inquire", via: "official", url: "https://www.caravellehotel.com/contact-us/", check: "fetched", checkedDate: "2026-11-02", note: "Caravelle Saigon hotel contact page; ask for Saigon Saigon Rooftop Bar." }
    ],
    reservationStatus: "proposed", note: "Reopening date comes from a single local guide; verify with the hotel."
  },
  {
    id: "dine-social-club-saigon", city: "Ho Chi Minh City", name: "Social Club Rooftop Bar (Hotel des Arts Saigon)", featured: false,
    status: "estimated", sourceUrl: "https://www.therooftopguide.com/rooftop-bars-in-ho-chi-minh/social-club-at-hotel-des-arts-saigon.html", checkedDate: "2026-11-02",
    image: "vietnam-option-2/images/general/opera-house.jpg",
    imageAlt: "Saigon Opera House before sunrise",
    imageNote: "Central Saigon landmark photo; not the venue.",
    cuisine: "Rooftop cocktails and dining",
    location: "Hotel des Arts Saigon, District 3",
    michelin: null,
    description: "Rooftop terrace with an infinity pool, described by a rooftop guide as a luxurious, natural-feeling setting.",
    hours: null, dressCode: null, menu: null, priceEstimate: null,
    reservationUrl: null, menuUrl: null,
    bookingLinks: [
      { kind: "reserve", via: "official", url: "https://www.hoteldesartssaigon.com/restaurants-bars/social-club-rooftop-bar/", check: "fetched", checkedDate: "2026-11-02", note: "Official bar page; it invites guests to reserve a table in advance and lists the contact details." }
    ],
    reservationStatus: "proposed", note: "Listed from a rooftop directory; confirm hours, dress code and booking with the hotel."
  }
];

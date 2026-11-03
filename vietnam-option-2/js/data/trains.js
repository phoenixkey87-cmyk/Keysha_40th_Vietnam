window.VO2_DATA = window.VO2_DATA || {};
/* Part 3 trains data (OD4). Train comparisons are ONLY against the domestic flights a
   train could replace; a train NEVER replaces the transpacific leg.
   Convention mirrors hotels.js / itinerary.js: every numeric or text fact starts null
   with status 'not_verified'; a null field is omitted by the renderer, and no price is
   invented. Durations and routes below are dated, sourced observations (status
   'reported'); exact per-person November 2027 fares are left 'not verified' with a link
   to check, because no operator publishes 2027 fares yet.
   replaceableLegs encode OD4:
     A (arrives HAN): HAN->DAD primary incl. the Hue-Da Nang scenic stretch; DAD->SGN
       listed with a ~16h long-rail flag; HAN<->Sapa (Lao Cai) is an OFF-ROUTE optional
       add-on that replaces no flight.
     B (arrives DAD, this Option 2 itinerary): DAD->SGN with the same ~16h long-rail flag.
   checkedDate 2026-11-02 matches the rest of the site (information as of that date). */
window.VO2_DATA.trainsMeta = {
  checkedDate: "2026-11-02",
  note: "Train times, classes and prices are set by Vietnam Railways (dsvn.vn) and the private operators; November 2027 schedules and fares are not published yet. Figures below are dated observations from the sources linked on each card, not quotes for your dates. A train is only ever compared with the domestic flight it could replace \u2014 never with the transpacific flight. Confirm everything on the operator or booking site before planning around it.",
  noteSourceUrl: "https://dsvn.vn/",
  operators: [
    { name: "Vietnam Railways (dsvn.vn)", url: "https://dsvn.vn/" },
    { name: "Baolau", url: "https://www.baolau.com/" },
    { name: "12Go", url: "https://12go.asia/" }
  ],
  replaceableLegs: {
    A: [
      { id: "legA-han-dad", from: "HAN", to: "DAD", primary: true, scenic: true, replacesFlight: "HAN-DAD", longRailFlag: false, note: "Includes the Hue\u2013Da Nang scenic stretch over the Hai Van Pass." },
      { id: "legA-dad-sgn", from: "DAD", to: "SGN", primary: false, scenic: false, replacesFlight: "DAD-SGN", longRailFlag: true, note: "Long rail time (about 16 hours); listed for completeness." },
      { id: "legA-han-sapa", from: "HAN", to: "Lao Cai (Sapa)", primary: false, scenic: true, replacesFlight: null, offRoute: true, longRailFlag: false, note: "Off-itinerary optional add-on; replaces no flight." }
    ],
    B: [
      { id: "legB-dad-sgn", from: "DAD", to: "SGN", primary: true, scenic: false, replacesFlight: "DAD-SGN", longRailFlag: true, note: "Long rail time (about 16 hours)." }
    ]
  }
};

/* Each record carries classes[] with BOTH sleeper and seated_premium where they exist.
   price.planningUsd stays null (status 'not_verified') unless a confirmed 2027 fare exists;
   a checkLink gives the user somewhere to verify. durationText/comfort are dated, sourced
   observations (status 'reported'). replacesFlight ties a record to the flight it compares
   against; offRoute records (Sapa) replace no flight and are excluded from that table. */
window.VO2_DATA.trains = [
  {
    id: "train-dad-sgn", itineraries: ["A", "B"], segment: "DAD-SGN",
    from: "DAD", to: "SGN", fromName: "Da Nang", toName: "Ho Chi Minh City (Saigon)",
    operator: "Vietnam Railways (Reunification Express)",
    replacesFlight: "DAD-SGN", longRailFlag: true, offRoute: false, scenic: false,
    status: "reported", sourceUrl: "https://www.travelchinaguide.com/asia/vietnam/ho-chi-minh-to-da-nang-trains.htm", checkedDate: "2026-11-02",
    durationText: "About 16\u201321 hours depending on the train (fastest schedules near 17h).",
    durationStatus: "reported", durationSourceUrl: "https://vietnamtraintickets.info/da-nang-to-sai-gon-by-train/",
    distanceText: "About 935 km (581 miles) along the coast.",
    distanceSourceUrl: "https://www.travelchinaguide.com/asia/vietnam/ho-chi-minh-to-da-nang-trains.htm",
    comfort: "Overnight sleeper berth recommended for a trip this long; the Reunification Express runs several pairs a day.",
    classes: [
      {
        kind: "sleeper", label: "Soft sleeper berth (4-berth air-conditioned)",
        priceUsd: null, priceStatus: "not_verified",
        priceNote: "No confirmed November 2027 fare. Check the operator or a booking site for your date.",
        checkLink: "https://dsvn.vn/", checkLinkLabel: "Check fares on Vietnam Railways"
      },
      {
        kind: "seated_premium", label: "Soft seat (air-conditioned)",
        priceUsd: null, priceStatus: "not_verified",
        priceNote: "No confirmed November 2027 fare. A seat is cheaper than a berth but less comfortable overnight.",
        checkLink: "https://www.baolau.com/", checkLinkLabel: "Check fares on Baolau"
      }
    ],
    note: "Listed for completeness. For this segment a short domestic flight is far quicker; the train is an option only if you prefer the overnight rail experience."
  },
  {
    id: "train-han-dad", itineraries: ["A"], segment: "HAN-DAD",
    from: "HAN", to: "DAD", fromName: "Hanoi", toName: "Da Nang",
    operator: "Vietnam Railways + tourist sleeper operators (Violette, Livitrans, Lotus, Laman)",
    replacesFlight: "HAN-DAD", longRailFlag: false, offRoute: false, scenic: true,
    status: "reported", sourceUrl: "https://north-vietnam.com/hanoi-to-da-nang-train-bus-schedule-timetable-tickets/", checkedDate: "2026-11-02",
    durationText: "About 15\u201318 hours overnight (fastest SE service around 15h).",
    durationStatus: "reported", durationSourceUrl: "https://sapanomad.com/hanoi-hoi-an-train/",
    distanceText: "About 740\u2013790 km; every train stops at Da Nang.",
    distanceSourceUrl: "https://sapanomad.com/train-from-hanoi-to-da-nang/",
    scenicStretch: "Includes the Hue\u2013Da Nang stretch over the Hai Van Pass (about 2.5\u20133 hours, roughly 103\u2013108 km), often called the most scenic railway section in the country; daylight trains are best for the views.",
    scenicSourceUrl: "https://junglebosstours.com/explorer/tourism-blog/hai-van-pass-train-da-nang-hue",
    comfort: "Overnight sleeper berths or tourist cabins; the Hue\u2013Da Nang daylight leg is the highlight.",
    classes: [
      {
        kind: "sleeper", label: "Soft sleeper berth (4- or 6-berth; tourist cabins on Violette/Livitrans/Lotus/Laman)",
        priceUsd: null, priceStatus: "not_verified",
        priceNote: "No confirmed November 2027 fare; tourist sleeper trains have reportedly started around US$60/person, regular trains lower. Check for your date.",
        checkLink: "https://dsvn.vn/", checkLinkLabel: "Check fares on Vietnam Railways"
      },
      {
        kind: "seated_premium", label: "Soft seat (air-conditioned)",
        priceUsd: null, priceStatus: "not_verified",
        priceNote: "No confirmed November 2027 fare. A seat is the budget option; a berth is better overnight.",
        checkLink: "https://12go.asia/", checkLinkLabel: "Check fares on 12Go"
      }
    ],
    note: "Primary Part 3 rail option for Itinerary A (arrives HAN). The scenic Hue\u2013Da Nang stretch is the reason to take it by train."
  },
  {
    id: "train-han-sapa", itineraries: ["A"], segment: "HAN-SAPA",
    from: "HAN", to: "Lao Cai (Sapa)", fromName: "Hanoi", toName: "Lao Cai (Sapa)",
    operator: "Tourist sleeper operators (Sapaly, King Express, Livitrans, Violette)",
    replacesFlight: null, longRailFlag: false, offRoute: true, scenic: true,
    status: "reported", sourceUrl: "https://sapanomad.com/transport/train-hanoi-to-sapa/", checkedDate: "2026-11-02",
    durationText: "About 8 hours overnight to Lao Cai, then roughly a 1-hour (~32 km) road transfer up to Sapa town (about 9 hours door to door).",
    durationStatus: "reported", durationSourceUrl: "https://sapanomad.com/hanoi-to-sapa-train-duration/",
    comfort: "Wood-panelled tourist sleeper carriages; cabins from shared 4-berth to private 2-berth / VIP.",
    classes: [
      {
        kind: "sleeper", label: "Shared 4-berth soft sleeper",
        priceUsd: null, priceStatus: "not_verified",
        priceNote: "No confirmed November 2027 fare; shared 4-berth cabins have reportedly started around US$39/person. Check for your date.",
        checkLink: "https://dsvn.vn/", checkLinkLabel: "Check fares on Vietnam Railways"
      },
      {
        kind: "seated_premium", label: "Private 2-berth / VIP cabin",
        priceUsd: null, priceStatus: "not_verified",
        priceNote: "No confirmed November 2027 fare; private 2-berth cabins have reportedly started around US$160. Check for your date.",
        checkLink: "https://www.baolau.com/", checkLinkLabel: "Check fares on Baolau"
      }
    ],
    note: "Off-itinerary optional add-on only. Neither itinerary routes through Sapa, so this train replaces no flight and is excluded from the fly-vs-train comparison table."
  }
];

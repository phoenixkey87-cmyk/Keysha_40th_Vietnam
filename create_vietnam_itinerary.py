"""
Generate a polished Word document for Keysha's 40th Birthday Vietnam Itinerary.
"""
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import os

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "Keysha_40th_Vietnam_Itinerary.docx")
LOGO_PATH = os.path.join(os.path.dirname(__file__), "Itineraries", "Phoenix-01.png")

# Color palette — Phoenix Travels branding
DARK_PURPLE = RGBColor(0x5B, 0x21, 0x7F)  # deep purple (primary)
MEDIUM_PURPLE = RGBColor(0x7B, 0x1F, 0xA2)  # medium purple (accents)
LIGHT_PURPLE = RGBColor(0x9C, 0x27, 0xB0)  # lighter purple for callouts
MAGENTA = RGBColor(0xB8, 0x86, 0x0B)  # dark gold/bronze for wake-up and important alerts
DARK_CHARCOAL = RGBColor(0x2D, 0x2D, 0x2D)  # dark charcoal (text headers)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x00, 0x00, 0x00)
LIGHT_GRAY = RGBColor(0xF5, 0xF5, 0xF5)

doc = Document()

# Set default font
style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)

# --- Helper Functions ---
def set_cell_shading(cell, color_hex):
    """Set background color of a table cell."""
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), color_hex)
    shading.set(qn('w:val'), 'clear')
    cell._tc.get_or_add_tcPr().append(shading)

def add_styled_table(doc, headers, rows, col_widths=None):
    """Add a formatted table with purple header row."""
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Header row
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ''
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = WHITE
        run.font.size = Pt(10)
        set_cell_shading(cell, '5B217F')
    # Data rows
    for r_idx, row_data in enumerate(rows):
        for c_idx, val in enumerate(row_data):
            cell = table.rows[r_idx + 1].cells[c_idx]
            cell.text = val
            cell.paragraphs[0].runs[0].font.size = Pt(10) if cell.paragraphs[0].runs else None
            if r_idx % 2 == 1:
                set_cell_shading(cell, 'F5F5F5')
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)
    return table

def add_heading_styled(doc, text, level=1):
    """Add a heading with custom styling."""
    heading = doc.add_heading(text, level=level)
    for run in heading.runs:
        run.font.color.rgb = DARK_PURPLE if level == 1 else MEDIUM_PURPLE
    return heading

def add_callout(doc, text):
    """Add a highlighted callout paragraph."""
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.italic = True
    run.font.color.rgb = MAGENTA
    run.font.size = Pt(10)

def add_bullet_list(doc, items):
    """Add a bulleted list."""
    for item in items:
        p = doc.add_paragraph(item, style='List Bullet')
        for run in p.runs:
            run.font.size = Pt(10)

def add_hyperlink(paragraph, url, text):
    """Add a clickable hyperlink to a paragraph."""
    part = paragraph.part
    r_id = part.relate_to(url, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', is_external=True)
    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id)
    new_run = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')
    color = OxmlElement('w:color')
    color.set(qn('w:val'), '0563C1')
    rPr.append(color)
    u = OxmlElement('w:u')
    u.set(qn('w:val'), 'single')
    rPr.append(u)
    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), '20')
    rPr.append(sz)
    new_run.append(rPr)
    t = OxmlElement('w:t')
    t.text = text
    new_run.append(t)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)

# --- TITLE PAGE ---
# Add Phoenix Travels logo centered
logo_para = doc.add_paragraph()
logo_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
logo_run = logo_para.add_run()
logo_run.add_picture(LOGO_PATH, width=Inches(2.5))

doc.add_paragraph()  # spacer after logo
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("Keysha's 40th Birthday Escape")
run.bold = True
run.font.size = Pt(28)
run.font.color.rgb = DARK_PURPLE

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run("Luxury, Culture & Coastal Bliss")
run.font.size = Pt(16)
run.font.color.rgb = MEDIUM_PURPLE

loc = doc.add_paragraph()
loc.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = loc.add_run("Vietnam  |  November 21-29, 2027")
run.font.size = Pt(14)
run.font.color.rgb = BLACK

route = doc.add_paragraph()
route.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = route.add_run("Hanoi  |  Genesis Regal Luxury Cruise  |  Da Nang  |  Ho Chi Minh City")
run.font.size = Pt(11)
run.font.color.rgb = DARK_PURPLE

doc.add_paragraph()  # spacer
note = doc.add_paragraph()
note.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = note.add_run(
    "Prepared as a working master itinerary for Keysha's 40th birthday group trip.\n"
    "Final rates, exact flight times, reservations, and hotel selections will be "
    "updated when November 2027 inventory is available."
)
run.font.size = Pt(9)
run.italic = True

doc.add_page_break()

# --- WELCOME ---
# NOTE: No more page breaks after this point - let content flow naturally
add_heading_styled(doc, "Welcome", level=1)
p = doc.add_paragraph(
    "Join Keysha for an unforgettable birthday escape through Vietnam. "
    "This group experience is designed to feel stylish, elevated, and easy to follow "
    "- with luxury where it matters, smart budgeting where it makes sense, and enough "
    "flexibility for everyone's travel style."
)
doc.add_paragraph()
add_callout(doc,
    "The trip includes a two-night Hanoi stay with shopping and custom shoes, a Genesis Regal Luxury Cruise "
    "through the Lan Ha Bay / Ha Long Bay region, a beach-resort stay in Da Nang "
    "with Hoi An shopping, and a Ho Chi Minh City finale featuring a Michelin-star "
    "dinner and All Black Everything night out."
)

add_callout(doc,
    "IMPORTANT: This is NOT a round-trip flight. Book a multi-city ticket: "
    "fly INTO Hanoi (HAN) and fly HOME from Ho Chi Minh City (SGN). "
    "We travel south through the country and depart from a different city than we arrive."
)

# --- DESTINATION OVERVIEWS ---
add_heading_styled(doc, "Your Destinations", level=1)

add_heading_styled(doc, "Hanoi", level=2)
p = doc.add_paragraph(
    "Vietnam's capital is a city of contrasts — ancient temples sit beside French colonial "
    "architecture, and buzzing motorbike streets open onto peaceful lakes. The Old Quarter "
    "is a sensory experience of narrow lanes packed with street food vendors, silk shops, "
    "and coffee houses. November brings mild, comfortable weather perfect for exploring on foot."
)
p.runs[0].font.size = Pt(10)
p = doc.add_paragraph()
run = p.add_run("Known For: ")
run.bold = True
run.font.size = Pt(10)
run.font.color.rgb = MEDIUM_PURPLE
run = p.add_run(
    "Pho (the original — rich bone broth with fresh herbs and rice noodles), bun cha "
    "(grilled pork with vermicelli, made famous by Obama's visit), egg coffee (ca phe trung — "
    "a creamy whipped egg yolk topping over strong Vietnamese coffee), and banh mi (crispy "
    "baguette sandwiches with pate, pickled vegetables, and herbs). Hanoi's food is subtle, "
    "aromatic, and built on layered broths and fresh ingredients."
)
run.font.size = Pt(10)

add_heading_styled(doc, "Lan Ha Bay / Ha Long Bay", level=2)
p = doc.add_paragraph(
    "A UNESCO World Heritage landscape of thousands of limestone karsts and islands rising "
    "from emerald waters. Cruising through the bay feels otherworldly — expect dramatic cliff "
    "faces, hidden caves, floating fishing villages, and stunning sunrises. The Genesis Regal "
    "cruise navigates the less-crowded Lan Ha Bay area for a more intimate, boutique experience."
)
p.runs[0].font.size = Pt(10)
p = doc.add_paragraph()
run = p.add_run("Known For: ")
run.bold = True
run.font.size = Pt(10)
run.font.color.rgb = MEDIUM_PURPLE
run = p.add_run(
    "Fresh seafood prepared onboard — think whole grilled prawns, steamed fish with ginger "
    "and lime, crab spring rolls, and Vietnamese-style seafood hot pot. The cruise kitchen "
    "sources directly from local fishing villages. Expect full-board fine dining with a mix "
    "of traditional Vietnamese courses and international options, plus cooking classes where "
    "you can learn to make your own spring rolls and pho."
)
run.font.size = Pt(10)

add_heading_styled(doc, "Da Nang & Hoi An", level=2)
p = doc.add_paragraph(
    "Da Nang is a modern coastal city with long stretches of white-sand beach, luxury resorts, "
    "and a relaxed pace. Just 30 minutes away, Hoi An Ancient Town is a UNESCO site known for "
    "its lantern-lined streets, centuries-old architecture, and world-famous tailor shops where "
    "you can get custom clothing made in 24-48 hours. Together they offer the perfect mix of "
    "beach relaxation and cultural shopping."
)
p.runs[0].font.size = Pt(10)
p = doc.add_paragraph()
run = p.add_run("Known For: ")
run.bold = True
run.font.size = Pt(10)
run.font.color.rgb = MEDIUM_PURPLE
run = p.add_run(
    "Cao lau (thick noodles with pork, herbs, and crispy croutons — only made in Hoi An using "
    "water from a specific local well), banh xeo (sizzling crispy crepes stuffed with shrimp "
    "and bean sprouts), mi quang (turmeric noodles with a small amount of rich broth), and "
    "white rose dumplings (delicate shrimp dumplings unique to Hoi An). The food here is "
    "colorful, fresh, and deeply tied to the region's history."
)
run.font.size = Pt(10)

add_heading_styled(doc, "Ho Chi Minh City (Saigon)", level=2)
p = doc.add_paragraph(
    "Vietnam's largest city is energetic, modern, and full of nightlife. District 1 is the heart "
    "of the action — rooftop bars, Michelin-starred restaurants, designer boutiques, and bustling "
    "markets like Ben Thanh. The food scene ranges from street stalls to world-class dining. "
    "This is where the trip reaches its glamorous finale with the All Black Everything evening."
)
p.runs[0].font.size = Pt(10)
p = doc.add_paragraph()
run = p.add_run("Known For: ")
run.bold = True
run.font.size = Pt(10)
run.font.color.rgb = MEDIUM_PURPLE
run = p.add_run(
    "Bold southern-style Vietnamese food — broken rice with grilled pork (com tam), fresh spring "
    "rolls (goi cuon), hu tieu (southern pork noodle soup), and banh trang tron (rice paper "
    "salad snack). The city also has a world-class modern dining scene; Anan Saigon (your "
    "farewell dinner) holds a Michelin star for reimagining street food into elevated plates. "
    "Expect sweeter flavors, more coconut milk, and tropical fruit compared to the north."
)
run.font.size = Pt(10)

# --- QUICK TRIP SNAPSHOT ---
add_heading_styled(doc, "Quick Trip Snapshot", level=1)
snapshot_data = [
    ("Travel Dates", "November 21-29, 2027"),
    ("Actual Birthday", "November 23 - Birthday at Sea aboard Genesis Regal Luxury Cruise"),
    ("Estimated Budget", "$3,000-$3,500 per person (international airfare booked separately)"),
    ("Route", "Hanoi -> Cruise -> Da Nang / Hoi An -> Ho Chi Minh City"),
    ("Trip Style", "Luxury, culture, beach, shopping, nightlife, relaxation"),
    ("International Flights", "Each traveler books their own multi-city flight: fly INTO Hanoi, fly HOME from Ho Chi Minh City (not round trip)"),
    ("Domestic Flights", "Included in the land package"),
]
add_styled_table(doc, ["Category", "Details"], snapshot_data, col_widths=[5, 12])

# --- CONFIRMED AND PENDING DECISIONS ---
add_heading_styled(doc, "Confirmed and Pending Decisions", level=1)
decisions_data = [
    ("Hanoi Hotel", "Confirmed", "Anatole Hotel Hanoi for 2 nights, November 21-23"),
    ("Cruise", "Confirmed", "Genesis Regal Luxury Cruise, 2 days / 1 night, Nov 23-24"),
    ("Hoi An Hotel", "Confirmed", "Silk Sense Hoi An River Resort for 2 nights, November 24-26; night of Nov 26 not booked yet"),
    ("Ho Chi Minh City Hotel", "Finalists", "Mai House Saigon Hotel or La Siesta Premium Saigon"),
    ("Farewell Dinner", "Selected", "Anan Saigon, 1 Michelin Star, All Black Everything evening"),
    ("Nightlife", "Shortlist", "Piu Piu, Mershe Saigon, Weeknd Saigon, Afro Chill Lounge"),
]
add_styled_table(doc, ["Item", "Status", "Notes"], decisions_data, col_widths=[4.5, 3, 10])

# --- DAY-BY-DAY ITINERARY ---
add_heading_styled(doc, "Day-by-Day Master Itinerary", level=1)

days = [
    {
        "title": "Day 1 - Sunday, November 21: Welcome to Vietnam",
        "destination": "Hanoi",
        "weather": "72-77\u00b0F (22-25\u00b0C). Mild days with cooler mornings and evenings.",
        "stay": "Anatole Hotel Hanoi - night 1 of 2 (confirmed)",
        "wakeup": "No set wake-up time. Arrive and rest at your own pace.",
        "activities": [
            "Arrive in Hanoi",
            "Check into hotel",
            "Explore the Old Quarter if arrival time allows",
            "Get measured for custom shoes in the Old Quarter so they're ready before the cruise",
            "Shopping for Vietnamese coffee, silk, souvenirs, and local goods",
            "Optional welcome dinner for whoever arrives in time",
            "Rest up for a full shopping day tomorrow",
        ],
        "wear": "Comfortable Chic: airport outfit, sneakers, light cardigan or jacket, crossbody bag.",
        "note": "This night is intentionally comfortable and practical because arrival times may vary after long-haul flights.",
    },
    {
        "title": "Day 2 - Monday, November 22: Shopping & Custom Shoes in Hanoi",
        "destination": "Hanoi",
        "weather": "72-77\u00b0F (22-25\u00b0C). Mild days with cooler mornings and evenings.",
        "stay": "Anatole Hotel Hanoi - night 2 of 2",
        "wakeup": "Sleep in! No scheduled pickup. Shop at your own pace.",
        "activities": [
            "Relaxed breakfast at Anatole Hotel Hanoi (included)",
            "Custom shoe fitting and pickup (order on Nov 21 if possible so there's time for adjustments)",
            "Old Quarter shopping: Hang Dau (shoe street), Hang Gai (silk street), and local boutiques",
            "Shopping for Vietnamese coffee, silk, lacquerware, and souvenirs",
            "Coffee break by Hoan Kiem Lake",
            "Easy dinner in Hanoi",
            "Pick up any remaining orders, then pack an overnight bag for the cruise",
        ],
        "wear": "Comfortable Chic: easy walking outfit, sneakers or sandals, light layer, crossbody bag for shopping.",
        "note": None,
    },
    {
        "title": "Day 3 - Tuesday, November 23: Board the Cruise & Birthday at Sea",
        "destination": "Hanoi to Lan Ha Bay / Ha Long Bay region",
        "weather": "73-79\u00b0F (23-26\u00b0C). Pleasant with breezes on the water.",
        "stay": "Genesis Regal Luxury Cruise - night 1 of 1",
        "wakeup": "Early morning \u2014 be ready by 7:30 AM. Breakfast, check out, then cruise shuttle pickup at 8:00-8:30 AM.",
        "activities": [
            "Breakfast at Anatole Hotel Hanoi (included), then check out",
            "Genesis Regal transfer / shuttle pickup from Hanoi (approximately 8:00-8:30 AM, ~2.5-3 hour drive to the pier)",
            "Board the cruise and celebrate Keysha's actual birthday onboard",
            "Welcome lunch, scenic cruising, sundeck time, kayaking or cave excursion",
            "Birthday photos on the sundeck",
            "Request birthday cake / decorations / special dinner from Genesis Regal in advance",
            "Champagne toast or group birthday moment onboard",
        ],
        "wear": "Birthday at Sea: resort chic for boarding; beautiful birthday dinner outfit for the evening; light sweater for deck breezes.",
        "note": "This is the official birthday date: November 23. Additional celebration moments happen later in the week.",
    },
    {
        "title": "Day 4 - Wednesday, November 24: Cruise Return & Travel to Da Nang",
        "destination": "Lan Ha Bay / Ha Long Bay region to Da Nang",
        "weather": "78-83\u00b0F (26-28\u00b0C). Warm tropical weather with possible passing showers.",
        "stay": "Silk Sense Hoi An River Resort - night 1 of 2",
        "wakeup": "Early morning — cruise disembarkation schedule (typically 7:00-8:00 AM breakfast, then off by 9:00-9:30 AM). Travel day.",
        "activities": [
            "Breakfast / brunch onboard",
            "Disembark Genesis Regal Luxury Cruise",
            "Transfer back toward Hanoi / airport area",
            "Fly to Da Nang (~1.5 hour flight)",
            "Transfer to Silk Sense Hoi An River Resort (about 45 min from Da Nang airport; check-in from 2:00 PM; book the resort pickup 48 hours ahead)",
            "Easy evening, dinner, and rest",
        ],
        "wear": "Travel + Beach Arrival: comfortable travel set, sandals or sneakers, easy dinner outfit.",
        "note": None,
    },
    {
        "title": "Day 5 - Thursday, November 25: Relax & Celebrate in Da Nang",
        "destination": "Da Nang",
        "weather": "78-83\u00b0F (26-28\u00b0C). Warm, tropical, and beach-friendly.",
        "stay": "Silk Sense Hoi An River Resort - night 2 of 2",
        "wakeup": "Sleep in! No schedule. Wake up whenever you want — it's a beach and pool day.",
        "activities": [
            "Relaxing breakfast at the resort",
            "Beach and pool time",
            "Optional spa treatments",
            "Birthday photos at the beach",
            "Optional group birthday dinner in Da Nang",
            "Flexible day that considers everyone's energy levels after travel and the cruise",
        ],
        "wear": "Beach Luxury: swimsuit, cover-up, sunglasses, sandals. Elegant vacation dinner outfit at night.",
        "note": "This is a relaxed group celebration day, not a replacement for the November 23 birthday at sea.",
    },
    {
        "title": "Day 6 - Friday, November 26: Hoi An Shopping Day",
        "destination": "Da Nang / Hoi An",
        "weather": "78-83\u00b0F (26-28\u00b0C). Warm with possible passing shower.",
        "stay": "Da Nang resort",
        "wakeup": "Morning wake-up — aim for 8:00-8:30 AM. Breakfast then group transport to Hoi An.",
        "activities": [
            "Visit Hoi An Ancient Town (~30-40 min drive from resort)",
            "Shopping for custom clothing, dresses, blazers, leather goods, lanterns, artwork, handmade accessories",
            "Photos in the lantern streets",
            "Dinner in Hoi An or return to Da Nang for resort dinner",
        ],
        "wear": "Cute and Comfortable: matching two-piece set, comfortable sandals, hat, sunglasses, crossbody bag.",
        "note": "Hoi An is one of the best places in Vietnam for custom clothing and leather goods. Leave space in your luggage.",
    },
    {
        "title": "Day 7 - Saturday, November 27: Da Nang to Ho Chi Minh City",
        "destination": "Da Nang to Ho Chi Minh City / Saigon",
        "weather": "86-91\u00b0F (30-33\u00b0C). Hot, humid, and mostly dry.",
        "stay": "Mai House Saigon Hotel or La Siesta Premium Saigon",
        "wakeup": "Morning wake-up — depends on flight time. Plan for breakfast and checkout by 9:00-10:00 AM.",
        "activities": [
            "Breakfast and checkout",
            "Fly from Da Nang to Ho Chi Minh City (~1.5 hour flight)",
            "Check into hotel (~20-30 min from HCMC airport to District 1)",
            "Shopping / explore District 1 if time allows",
            "Optional rooftop cocktail or casual dinner",
        ],
        "wear": "City Chic: lightweight outfit, comfortable shoes, stylish dinner look.",
        "note": None,
    },
    {
        "title": "Day 8 - Sunday, November 28: All Black Everything Finale",
        "destination": "Ho Chi Minh City",
        "weather": "86-91\u00b0F (30-33\u00b0C) daytime; around 80\u00b0F (27\u00b0C) in the evening.",
        "stay": "Mai House Saigon Hotel or La Siesta Premium Saigon",
        "wakeup": "Sleep in! No morning schedule. Rest up for the big night out.",
        "activities": [
            "Shopping at Ben Thanh Market and nearby boutiques",
            "Free time / rest before the evening",
            "All Black Everything dress code",
            "Michelin-star farewell dinner at Anan Saigon",
            "Rooftop cocktails",
            "Group photos",
            "Hip-Hop / Afrobeats night out",
            "Return to hotel together using Grab",
        ],
        "wear": "All Black Everything: all-black attire, gold accessories encouraged, glam hair and makeup, dress to impress.",
        "note": "Club options to choose later: Piu Piu, Mershe Saigon, Weeknd Saigon, Afro Chill Lounge.",
    },
    {
        "title": "Day 9 - Monday, November 29: Departure Day",
        "destination": "Ho Chi Minh City",
        "weather": "86-91\u00b0F (30-33\u00b0C). Hot and humid.",
        "stay": "Checkout day",
        "wakeup": "Depends on flight time. Allow 3+ hours before departure for checkout and airport transfer.",
        "activities": [
            "Breakfast",
            "Hotel checkout",
            "Airport transfer (~20-30 min to Tan Son Nhat International Airport)",
            "Fly home",
        ],
        "wear": "Airport Comfortable: jogger set or matching sweatsuit, sneakers, light jacket for the flight.",
        "note": None,
    },
]

# Render each day
for day in days:
    add_heading_styled(doc, day["title"], level=2)
    p = doc.add_paragraph()
    run = p.add_run(f"Destination: ")
    run.bold = True
    run.font.size = Pt(10)
    run = p.add_run(day["destination"])
    run.font.size = Pt(10)

    p = doc.add_paragraph()
    run = p.add_run(f"Expected Weather: ")
    run.bold = True
    run.font.size = Pt(10)
    run = p.add_run(day["weather"])
    run.font.size = Pt(10)

    p = doc.add_paragraph()
    run = p.add_run(f"Stay: ")
    run.bold = True
    run.font.size = Pt(10)
    run = p.add_run(day["stay"])
    run.font.size = Pt(10)

    p = doc.add_paragraph()
    run = p.add_run(f"\u23f0 Wake-Up: ")
    run.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = MAGENTA
    run = p.add_run(day["wakeup"])
    run.font.size = Pt(10)

    # Activities
    p = doc.add_paragraph()
    run = p.add_run("Planned Activities")
    run.bold = True
    run.font.color.rgb = MEDIUM_PURPLE
    run.font.size = Pt(11)
    add_bullet_list(doc, day["activities"])

    # What to wear
    p = doc.add_paragraph()
    run = p.add_run("What to Wear: ")
    run.bold = True
    run.font.size = Pt(10)
    run = p.add_run(day["wear"])
    run.font.size = Pt(10)

    # Note / callout
    if day["note"]:
        add_callout(doc, day["note"])

    doc.add_paragraph()  # spacer between days

# --- HOTEL AND CRUISE DETAILS ---
add_heading_styled(doc, "Hotel and Cruise Details", level=1)

add_heading_styled(doc, "Hanoi - Anatole Hotel Hanoi (Confirmed)", level=2)
add_bullet_list(doc, [
    "2 nights, November 21-23 (check-in Sunday Nov 21, check-out Tuesday Nov 23)",
    "Grand Executive Twin City View, 1 room, 2 guests",
    "30 Nha Chung, Hanoi, near Hoan Kiem Lake and the Old Quarter",
    "Breakfast included, free WiFi, welcome drink, pool, and fitness center",
    "Shopping and custom shoes in Hanoi on November 21-22 before the cruise pickup on November 23",
])

add_heading_styled(doc, "Genesis Regal Luxury Cruise (Confirmed)", level=2)
add_bullet_list(doc, [
    "2 days / 1 night, November 23-24",
    "Chosen for boutique luxury, balcony cabins, great value, and intimate cruise experience",
    "Inclusions: en-suite room for 1 night, full-board meals, pool/jacuzzi, activities, sightseeing fees, tour guide, onboard insurance, service charges, birthday/anniversary bakery",
    "This is where Keysha will celebrate her actual birthday on November 23",
])
p = doc.add_paragraph()
run = p.add_run("Website: ")
run.bold = True
run.font.size = Pt(10)
add_hyperlink(p, "https://genesisregalcruise.com/", "genesisregalcruise.com")

add_heading_styled(doc, "Hoi An - Silk Sense Hoi An River Resort (Confirmed)", level=2)
add_bullet_list(doc, [
    "2 nights, November 24-26 (check-in Wednesday Nov 24 from 2:00 PM, check-out Friday Nov 26 by noon)",
    "Deluxe Double or Twin Room, Bathtub, Garden View (Private Garden), 2 guests",
    "01 Dong Da Street, Hoi An (about 45 minutes from Da Nang airport)",
    "Breakfast included, free WiFi, free self parking, 24-hour room service",
    "Airport pickup available (extra charge may apply): contact the resort at least 48 hours before arrival (Tel: +84 235 3754999)",
    "Free cancellation until November 17, 2027",
    "Night of November 26: not booked yet",
])
doc.add_paragraph()
add_heading_styled(doc, "Ho Chi Minh City Hotel Finalists", level=2)
hcmc_data = [
    ("Mai House Saigon Hotel", "Elegant, quieter luxury feel; short Grab ride to nightlife; better for sleep and calm after going out"),
    ("La Siesta Premium Saigon", "Boutique luxury, rooftop bar/pool, central District 1 location, breakfast, easy access to shopping/nightlife"),
]
add_styled_table(doc, ["Hotel", "Why It Fits"], hcmc_data, col_widths=[6, 12])
p = doc.add_paragraph()
run = p.add_run("Websites: ")
run.bold = True
run.font.size = Pt(10)
add_hyperlink(p, "https://maihouse.com.vn/", "Mai House Saigon")
run = p.add_run("  |  ")
run.font.size = Pt(10)
add_hyperlink(p, "https://lasiestapremiumsaigon.com/", "La Siesta Premium Saigon")

# --- DINING AND CELEBRATION MOMENTS ---
add_heading_styled(doc, "Dining and Celebration Moments", level=1)

add_heading_styled(doc, "November 23 - Birthday at Sea", level=2)
add_bullet_list(doc, [
    "Actual birthday celebration onboard Genesis Regal Luxury Cruise",
    "Request birthday cake, table decor, or special dinner in advance if available",
    "Sunset photos and group toast on the sundeck",
])

add_heading_styled(doc, "November 25 - Relaxed Da Nang Celebration", level=2)
add_bullet_list(doc, [
    "Beach and pool day",
    "Optional spa treatments",
    "Birthday photos at the resort",
    "Optional group dinner for a more relaxed celebration after the cruise",
])

add_heading_styled(doc, "November 28 - Anan Saigon Michelin-Star Farewell Dinner", level=2)
add_bullet_list(doc, [
    "Anan Saigon is a One Michelin Star restaurant in Ho Chi Minh City",
    "Selected as the signature farewell dining experience for All Black Everything night",
    "Modern Vietnamese cuisine inspired by street food",
    "A la carte recommended for group budget flexibility",
    "Estimated dishes: ~$8-$27 per dish; typical dinner ~$75-$100 per person with drinks",
    "Tasting menus may be available for guests who want the full experience",
])
p = doc.add_paragraph()
run = p.add_run("Website: ")
run.bold = True
run.font.size = Pt(10)
add_hyperlink(p, "https://anansaigon.com/", "anansaigon.com")
run = p.add_run("  |  ")
run.font.size = Pt(10)
add_hyperlink(p, "https://anansaigon.com/booking/", "Make a Reservation")

# --- SHOPPING GUIDE ---
add_heading_styled(doc, "Shopping Guide", level=1)
shopping_data = [
    ("Hanoi", "Old Quarter: Vietnamese coffee, silk, souvenirs, small gifts, local goods"),
    ("Hoi An", "Custom dresses, suits, blazers, leather goods, lanterns, artwork, handmade accessories"),
    ("Ho Chi Minh City", "Ben Thanh Market, boutiques, malls, fashion finds, skincare, souvenirs"),
]
add_styled_table(doc, ["City", "Shopping Plan"], shopping_data, col_widths=[4, 14])
doc.add_paragraph()
add_callout(doc, "Suggested personal shopping budget: $300-$500. Pack a foldable duffel bag or leave suitcase space.")

# --- NIGHT OUT AND SAFETY ---
doc.add_paragraph()
add_heading_styled(doc, "Night Out and Safety Plan", level=1)
add_bullet_list(doc, [
    "Stay in or near central areas with easy Grab access",
    "Use Grab instead of hailing taxis whenever possible",
    "Travel together at night and return together after the club",
    "Avoid staying directly on extremely noisy party streets if sleep is important",
    "Club shortlist: Piu Piu, Mershe Saigon, Weeknd Saigon, Afro Chill Lounge",
])

# --- WEATHER AND WHAT TO WEAR SUMMARY ---
add_heading_styled(doc, "Weather and What to Wear Summary", level=1)
weather_data = [
    ("Nov 21-23", "Hanoi", "72-77\u00b0F; mild, cooler evenings", "Comfortable chic, light jacket, sneakers"),
    ("Nov 23-24", "Cruise", "73-79\u00b0F; pleasant, breezy on water", "Resort chic, swimwear, cover-ups, light sweater"),
    ("Nov 24-27", "Da Nang / Hoi An", "78-83\u00b0F; warm tropical, possible showers", "Beach luxury, sandals, vacation dresses, umbrella"),
    ("Nov 27-29", "Ho Chi Minh City", "86-91\u00b0F; hot, humid, mostly dry", "City chic, breathable fabrics, stylish dinner outfits"),
    ("Nov 28", "All Black Everything", "Warm evening ~80\u00b0F", "All black with gold accessories; glam encouraged"),
]
add_styled_table(doc, ["Dates", "Location", "Expected Weather", "What to Wear"], weather_data, col_widths=[3, 4, 5.5, 6])

# --- PACKING CHECKLIST ---
doc.add_paragraph()
add_heading_styled(doc, "Packing Checklist", level=1)
packing_data = [
    ("Documents", "Passport, Vietnam e-visa, flight confirmations, hotel confirmations, travel insurance, emergency contacts"),
    ("Clothing", "Airport outfit, resort wear, swimsuits, cover-ups, vacation dresses, city outfits, All Black Everything look, light jacket"),
    ("Shoes", "Comfortable sneakers, sandals, dressy sandals/heels"),
    ("Tech", "Portable charger, universal adapter, phone charger, camera if desired"),
    ("Health/Comfort", "Sunscreen, insect repellent, hand sanitizer, tissues, personal medication, probiotics, Imodium, Dramamine/Bonine, personal soap and washcloth"),
    ("Cruise/Beach", "Waterproof phone pouch, sunglasses, hat, beach bag"),
    ("Shopping", "Foldable duffel bag or extra suitcase room"),
]
add_styled_table(doc, ["Category", "Items"], packing_data, col_widths=[4, 14])

# --- PAYMENT SCHEDULE ---
add_heading_styled(doc, "Payment Schedule", level=1)
p = doc.add_paragraph(
    "The payment plan is designed so travelers can pay toward the trip gradually "
    "instead of one large lump-sum payment. International airfare is booked separately by each traveler."
)
p.runs[0].font.size = Pt(10)
doc.add_paragraph()
payment_data = [
    ("January 2027", "$250", "Deposit - secures your spot (non-refundable)"),
    ("March 2027", "$900", "Genesis Regal Luxury Cruise (2 days / 1 night, full board)"),
    ("May 2027", "$750", "Hotels - Hanoi (2 nights), Da Nang (3 nights), Ho Chi Minh City (2 nights)"),
    ("July 2027", "$350", "Domestic flights - Hanoi to Da Nang and Da Nang to HCMC"),
    ("September 2027", "$500", "Transfers, Hoi An transport, farewell dinner, group activities"),
    ("October 2027", "Final balance", "Any remaining balance; final itinerary and pre-departure meeting"),
]
add_styled_table(doc, ["Due Date", "Amount", "What It Covers"], payment_data, col_widths=[4, 3.5, 10])

p = doc.add_paragraph()
run = p.add_run("Payment Methods: ")
run.bold = True
run.font.size = Pt(10)
run = p.add_run("Venmo @PhoenixTravel  |  CashApp @PhoenixTravel  |  PayPal @ohphoenix")
run.font.size = Pt(10)

# --- INCLUDED / NOT INCLUDED ---
doc.add_paragraph()
add_heading_styled(doc, "Included in Land Package", level=2)
add_bullet_list(doc, [
    "Hotels",
    "Genesis Regal Luxury Cruise",
    "Domestic flights within Vietnam",
    "Airport transfers within Vietnam",
    "Cruise transfers",
    "Breakfast at hotels where included",
    "All meals during the cruise",
    "Farewell birthday dinner",
    "Scheduled group activities / transportation where listed",
])

add_heading_styled(doc, "Not Included", level=2)
add_bullet_list(doc, [
    "International airfare from the U.S. to Vietnam",
    "Travel insurance",
    "Passport fees",
    "Vietnam visa fees",
    "Shopping",
    "Alcoholic beverages",
    "Meals not listed as included",
    "Optional excursions",
    "Personal spending money",
    "Grab / Uber rides (personal transportation outside of scheduled group transfers)",
])

# --- VISA AND ENTRY REQUIREMENTS ---
add_heading_styled(doc, "Vietnam Visa and Entry Requirements", level=1)
add_bullet_list(doc, [
    "Most U.S. travelers need a visa to enter Vietnam",
    "Estimated single-entry e-visa cost: approximately $25 USD",
    "Estimated multiple-entry e-visa cost: approximately $50 USD (this itinerary should only require single entry)",
    "Begin reviewing requirements 90-120 days before departure",
    "Submit the e-visa application at least 8 weeks before departure (by late September 2027)",
    "Passport should be valid for at least 6 months beyond arrival and have blank pages available",
    "Print and save digital copies of passport, visa, flights, hotel confirmations, and travel insurance",
])
add_callout(doc, "Do not wait until the last minute to apply for the Vietnam e-visa. Travelers without required documents may be denied boarding or entry.")

p = doc.add_paragraph()
run = p.add_run("Apply here (official government site): ")
run.bold = True
run.font.size = Pt(10)
add_hyperlink(p, "https://evisa.gov.vn", "evisa.gov.vn")
p = doc.add_paragraph()
run = p.add_run("Only use the official .gov.vn website. Avoid third-party sites that charge extra fees.")
run.font.size = Pt(9)
run.italic = True

add_heading_styled(doc, "Register with the U.S. Embassy", level=2)
p = doc.add_paragraph(
    "Enroll in the Smart Traveler Enrollment Program (STEP) - a free service from the "
    "U.S. Department of State. It sends you safety alerts and helps the embassy reach you in an emergency abroad."
)
p.runs[0].font.size = Pt(10)
p = doc.add_paragraph()
run = p.add_run("Register here: ")
run.bold = True
run.font.size = Pt(10)
add_hyperlink(p, "https://step.state.gov", "step.state.gov")

# --- HELPFUL TIPS ---
doc.add_paragraph()
add_heading_styled(doc, "Helpful Tips and Know Before You Go", level=1)

add_heading_styled(doc, "Apps to Download", level=2)
add_bullet_list(doc, [
    "Grab - rideshare and transportation",
    "Google Translate",
    "Google Maps with offline maps downloaded",
    "WhatsApp for group communication",
    "Airline apps",
])

add_heading_styled(doc, "Money", level=2)
add_bullet_list(doc, [
    "Vietnam uses the Vietnamese Dong (VND)",
    "Credit cards are accepted at many hotels and larger restaurants",
    "Carry cash for markets, street vendors, tips, and small businesses",
    "Notify banks and credit card companies before travel",
])

add_heading_styled(doc, "Transportation", level=2)
add_bullet_list(doc, [
    "Use Grab whenever possible",
    "Share ride details if traveling separately",
    "Travel together at night",
    "Hotel-arranged transfers may be used for airport and group movements",
])

add_heading_styled(doc, "Group Travel Expectations", level=2)
add_bullet_list(doc, [
    "Be on time for scheduled activities",
    "Respect different vacation styles and personal time",
    "Communicate if plans change or if running late",
    "Stay flexible",
    "Have fun, take pictures, and celebrate Keysha's 40th birthday in Vietnam",
])

add_heading_styled(doc, "Budget & Tipping Tips", level=2)
add_bullet_list(doc, [
    "Meals at nice restaurants will cost around $10-$20 USD per person; street food and casual spots are $3-$7",
    "All included meals are listed, but we encourage you to tip tour guides, drivers, and cruise staff",
    "Please be mindful that our tour guides and drivers work largely off TIPS - it is customary and appreciated",
    "Shopping will be available at each location - please have separate money for food, shopping, and tips",
    "Please tell your banks/credit card companies that you will be traveling abroad",
    "As with any tourist destination, pickpocketing and theft can be a concern in busy areas. Be vigilant and don't leave belongings unattended. Use a money belt or hidden pouch for passports, credit cards, and cash. Avoid flashing valuable items.",
    "Food & Stomach Prep: Vietnamese food is fresh and delicious, but your stomach may need time to adjust to new ingredients, spices, and street food. Bring probiotics (start taking them a week before the trip), Imodium, and motion sickness/nausea medicine (Dramamine or Bonine - helpful for the cruise and winding roads). Stay hydrated and only drink bottled or filtered water.",
])

add_heading_styled(doc, "Travel Insurance", level=2)
p = doc.add_paragraph("Travel insurance is strongly recommended for international trips. We suggest:")
p.runs[0].font.size = Pt(10)
p = doc.add_paragraph()
add_hyperlink(p, "https://www.allianztravelinsurance.com/", "Allianz Travel Insurance")

# --- IMPORTANT DATES AT A GLANCE ---
add_heading_styled(doc, "Important Dates at a Glance", level=1)
dates_data = [
    ("January 2027", "$250 deposit due; secure spot; begin monitoring international airfare"),
    ("February 2027", "$300 monthly payment #1"),
    ("March 2027", "$300 monthly payment #2"),
    ("April 2027", "$300 monthly payment #3; Genesis Regal cruise targeted to be paid in full"),
    ("May 2027", "$300 monthly payment #4"),
    ("June 2027", "$300 monthly payment #5"),
    ("July 2027", "$300 monthly payment #6; hotels targeted to be paid in full"),
    ("August 2027", "$300 monthly payment #7; domestic flights/transfers; begin checking visa requirements"),
    ("September 2027", "$300 monthly payment #8; apply for Vietnam e-visa (8 weeks before departure); finalize group activities and dinner"),
    ("October 2027", "Final balance if needed; final itinerary; packing guide; pre-departure meeting"),
    ("November 21, 2027", "Departure / arrival in Hanoi"),
    ("November 23, 2027", "Keysha's actual birthday - Birthday at Sea"),
    ("November 25, 2027", "Relaxed birthday celebration day in Da Nang"),
    ("November 28, 2027", "All Black Everything finale and Anan Saigon dinner"),
    ("November 29, 2027", "Fly home"),
]
add_styled_table(doc, ["Month / Date", "Milestone"], dates_data, col_widths=[4.5, 13])

# --- WORKING NOTES ---
doc.add_paragraph()
add_heading_styled(doc, "Working Notes for Final Booking", level=1)
add_bullet_list(doc, [
    "Book the night of November 26 (Silk Sense Hoi An River Resort is booked Nov 24-26)",
    "Compare Mai House Saigon vs La Siesta Premium Saigon once rates are available",
    "Confirm Genesis Regal birthday arrangements in advance",
    "Confirm Anan Saigon group reservation policies and menu availability closer to travel",
    "Finalize club choice based on current music nights closer to travel",
    "Update final document with actual prices, flight times, and transfer details once booked",
])

# --- SAVE ---
doc.save(OUTPUT_PATH)
print(f"Document saved to: {OUTPUT_PATH}")


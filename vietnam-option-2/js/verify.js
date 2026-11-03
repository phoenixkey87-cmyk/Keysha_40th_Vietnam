/* VIETNAM OPTION 2: "Items requiring verification" and "Photo Credits" sections. */
(function () {
  'use strict';
  var V = window.VO2, D = V && V.data;
  if (!V || !D) return;
  var el = V.el;

  /* ---------- items requiring verification ---------- */
  var host = document.getElementById('verificationBody');
  if (host) {
    var checked = [
      ['About this information', 'Details were gathered on 2 November 2026 from each venue\u2019s own site where one exists, otherwise from dated guides and listings. Rates, availability, lineups and opening hours for November 2027 will be confirmed at booking.'],
      ['Flights and schedules', 'International and Da Nang to Ho Chi Minh City flights are not booked. The flight helper only opens a Google Flights search. Arrival and departure times may force the first or last day to change.'],
      ['Hotel rates, availability and reviews', 'Ho Chi Minh City nightly figures are Proposed planning numbers under the $170 cap. Da Nang nightly figures are KAYAK observations dated 2 November 2026 (lowest price booked in the prior two weeks), and Da Nang hotels above $170 are shown as shared-room options. None are quotes. Star ratings, reviews and room availability for November 2027 need confirming with each hotel.'],
      ['Booking, reservation and inquiry links', 'Links lead to external sites, and rates and availability for November 2027 must be checked there. Some Booking.com links block automated checks and were confirmed from search results instead. Where a venue has no online booking page, the card gives its phone, chat or enquiry channel instead.'],
      ['Michelin status', 'Michelin recognition is shown as listed on each restaurant\u2019s own page on the check date. Re-check the current Michelin Guide before booking.'],
      ['Reservations and menus', 'No table is reserved. La Maison 1888 has a VND 1,000,000 per guest deposit and its venue was temporarily moved; Ănăn Saigon takes bookings by email. Ask both for 2027 availability and prices.'],
      ['Event schedules', 'No club night or event is confirmed for November 2027. Hours, cover charges, dress codes and table minimums need confirming close to the trip. CUR8 Saigon, Neighborhood Saigon and SKY36 publish weekly schedules on their own sites.'],
      ['Clinic services, eligibility and prices', 'Prices shown are the clinics\u2019 own published figures; ask each clinic for licence details. Body contouring needs a physician\u2019s assessment of eligibility, recovery and scheduling, and results are not guaranteed.'],
      ['Exchange rate', 'The VND rate is a dated reference figure and is editable.'],
      ['Opening hours', 'Hours are shown where a listing gives them; check the Map link for current hours.'],
      ['Visa and entry requirements', 'Check current Vietnam entry and visa rules for your passport before booking.'],
      ['Approximate map pins', 'Some map pins are area-level estimates. Use the Google Maps links to confirm.']
    ];
    var ul = el('ul', { cls: 'verify-list' });
    checked.forEach(function (c) {
      ul.appendChild(el('li', null, [el('strong', { text: c[0] + ': ' }), document.createTextNode(c[1])]));
    });
    host.appendChild(el('h3', { text: 'Items requiring verification' }));
    host.appendChild(ul);

    var cols = [['hotels', 'Hotels'], ['dining', 'Dining'], ['nightlife', 'Nightlife'], ['cafes', 'Cafés'], ['shopping', 'Shopping'], ['medical', 'Wellness']];
    var det = el('details', { cls: 'budget-calc' });
    det.appendChild(el('summary', { text: 'Records based on guides or listings, by section' }));
    var any = false;
    cols.forEach(function (c) {
      var list = (D[c[0]] || []).filter(function (r) { return r.status && r.status !== 'verified'; });
      if (!list.length) return;
      any = true;
      var u = el('ul');
      list.forEach(function (r) { u.appendChild(el('li', null, [document.createTextNode(r.name + ' '), V.statusBadge(r.status)])); });
      det.appendChild(el('h4', { text: c[1] }));
      det.appendChild(u);
    });
    if (any) host.appendChild(det);
    host.appendChild(el('p', { cls: 'small', text: 'The full checklist is in VERIFICATION_NEEDED_Vietnam_Option_2.md.' }));
  }

  /* ---------- photo credits ---------- */
  var cbody = document.getElementById('creditsBody');
  if (cbody && Array.isArray(D.credits)) {
    cbody.appendChild(el('p', { cls: 'lead', text: 'All photographs come from Wikimedia Commons under the licences shown. Each was resized for the web. Where a photo is illustrative rather than the exact venue, the card says so.' }));
    var wrap = el('div', { cls: 'table-scroll' });
    var t = el('table', { cls: 'compare-table' });
    t.appendChild(el('caption', { cls: 'sr-only', text: 'Photo credits' }));
    var hr = el('tr');
    ['Photo', 'Title and author', 'Licence', 'Source'].forEach(function (h) { hr.appendChild(el('th', { text: h, attrs: { scope: 'col' } })); });
    t.appendChild(el('thead', null, [hr]));
    var tb = el('tbody');
    D.credits.forEach(function (c) {
      var img = el('img', { attrs: { src: c.localPath, alt: c.title, loading: 'lazy', width: '80', height: '56' } });
      img.style.cssText = 'width:80px;height:56px;object-fit:cover;border-radius:6px;';
      var lic = el('td');
      if (c.licenseUrl) lic.appendChild(el('a', { text: c.license, attrs: { href: c.licenseUrl, target: '_blank', rel: 'noopener noreferrer' } }));
      else lic.textContent = c.license;
      var src = el('td', null, [el('a', { text: 'Wikimedia Commons', attrs: { href: c.sourceUrl, target: '_blank', rel: 'noopener noreferrer' } })]);
      tb.appendChild(el('tr', null, [el('td', null, [img]), el('td', { text: c.title + ' by ' + c.author }), lic, src]));
    });
    t.appendChild(tb);
    wrap.appendChild(t);
    cbody.appendChild(wrap);
  }
})();

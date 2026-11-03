/* VIETNAM OPTION 2 budget planner. Plain script, renders into #budgetBody.
   All amounts are planning estimates in USD. State is saved in localStorage key vo2_budget. */
(function () {
  'use strict';
  var V = window.VO2, D = V && V.data;
  var host = document.getElementById('budgetBody');
  if (!V || !host || !D || !Array.isArray(D.budget)) return;

  var el = V.el, FX = D.budgetFx || {}, DEF = D.budgetDefaults || {};
  var KEY = 'vo2_budget';
  var COLORS = ['#0b4d3a', '#c9a24b', '#b76e79', '#2f6f5e', '#8a6d1f', '#3b3b3b', '#d9b8b0', '#5d8f7e', '#e3c374', '#7a3e48', '#1f7a62', '#a8a29a', '#6b5b2a', '#4c4c4c', '#9c6b73'];
  var CAP = DEF.hotelCapUsdPerNight || 170;
  var HM = D.hotelsMeta || {};
  var SOFT = Array.isArray(HM.softCapCities) ? HM.softCapCities : [];
  var SHARE = DEF.sharedRoomGuests || (HM.sharedRoom && HM.sharedRoom.guests) || 2;

  function num(v, min) {
    var n = parseFloat(v);
    if (!isFinite(n) || n < (min || 0)) return 0;
    return n;
  }
  function defaults() {
    var rows = {};
    D.budget.forEach(function (r) { rows[r.id] = { qty: r.qty, unitUsd: r.unitUsd }; });
    var picks = {};
    (D.hotels || []).forEach(function (h) {
      var rate = h.rate && h.rate.planningUsd != null ? h.rate.planningUsd : 0;
      picks[h.id] = { nights: 0, rate: rate, guests: (rate > CAP && SOFT.indexOf(h.city) !== -1) ? SHARE : 1 };
    });
    return { travellers: DEF.travellers || 1, rows: rows, picks: picks, vnd: FX.vndPerUsd || 0 };
  }
  var state = (function () {
    var base = defaults(), saved = V.load(KEY, null);
    if (!saved || typeof saved !== 'object') return base;
    base.travellers = Math.max(1, Math.floor(num(saved.travellers, 1)) || 1);
    if (saved.vnd) base.vnd = num(saved.vnd);
    if (!base.vnd) base.vnd = FX.vndPerUsd || 0;
    D.budget.forEach(function (r) {
      var s = saved.rows && saved.rows[r.id];
      if (s) base.rows[r.id] = { qty: num(s.qty), unitUsd: num(s.unitUsd) };
    });
    Object.keys(base.picks).forEach(function (id) {
      var s = saved.picks && saved.picks[id];
      if (s) base.picks[id] = { nights: Math.floor(num(s.nights)), rate: num(s.rate), guests: s.guests == null ? base.picks[id].guests : Math.min(4, Math.max(1, Math.floor(num(s.guests, 1)) || 1)) };
    });
    return base;
  })();
  function persist() { V.save(KEY, state); }

  function hotelNights() {
    var n = 0, t = 0;
    Object.keys(state.picks).forEach(function (id) { n += state.picks[id].nights; t += state.picks[id].nights * state.picks[id].rate / state.picks[id].guests; });
    return { nights: n, total: t };
  }
  function rowValues(r) {
    var s = state.rows[r.id];
    if (r.linkedToHotels) {
      var h = hotelNights();
      if (h.nights > 0) return { qty: h.nights, unit: h.total / h.nights, total: h.total, locked: true };
    }
    return { qty: s.qty, unit: s.unitUsd, total: s.qty * s.unitUsd, locked: false };
  }
  function money(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  }
  function vnd(n) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n * state.vnd)) + ' VND';
  }

  /* ---------- skeleton ---------- */
  host.appendChild(el('p', { cls: 'notice', attrs: { role: 'note' }, text: 'Planning estimates only. Amounts marked Estimated are planning figures you can edit, rows marked Proposed start at $0 until you enter a quote, and nothing here is a booking or a price guarantee. Amounts are per person; the group total multiplies by the number of travellers.' }));

  var topRow = el('div', { cls: 'budget-top' });
  var travInput = el('input', { cls: 'select budget-input', attrs: { type: 'number', min: '1', step: '1', id: 'budTravellers', inputmode: 'numeric' } });
  var rateInput = el('input', { cls: 'select budget-input', attrs: { type: 'number', min: '1', step: '1', id: 'budRate', inputmode: 'decimal' } });
  topRow.appendChild(el('div', { cls: 'budget-field' }, [el('label', { attrs: { for: 'budTravellers' }, text: 'Travellers' }), travInput]));
  topRow.appendChild(el('div', { cls: 'budget-field' }, [el('label', { attrs: { for: 'budRate' }, text: 'VND per USD (editable)' }), rateInput]));
  var fxNote = el('p', { cls: 'budget-fx' });
  fxNote.appendChild(document.createTextNode('Default rate ' + new Intl.NumberFormat('en-US').format(FX.vndPerUsd || 0) + ' VND per USD, as of ' + (FX.asOf || 'unknown date') + ' (' + (FX.source || 'source unknown') + '). '));
  if (FX.sourceUrl) fxNote.appendChild(el('a', { text: 'Source', attrs: { href: FX.sourceUrl, target: '_blank', rel: 'noopener noreferrer' } }));
  fxNote.appendChild(document.createTextNode('. ' + (FX.note || '')));
  host.appendChild(topRow);
  host.appendChild(fxNote);

  /* hotel calculator */
  var calc = el('details', { cls: 'budget-calc', attrs: { open: '' } });
  calc.appendChild(el('summary', { text: 'Hotel calculator (feeds the Hotels row)' }));
  calc.appendChild(el('p', { cls: 'small', text: 'Nightly rates start at the Proposed planning figures from the hotel section, which are not quotes. Enter nights per hotel and edit the rate once you have a real quote. Each night is compared with the $' + CAP + ' per room target. Da Nang beachfront hotels above it can be shared: set Guests sharing to 2 and the subtotal becomes your per-person cost.' }));
  var calcWrap = el('div', { cls: 'table-scroll' });
  var calcTable = el('table', { cls: 'compare-table' });
  calcTable.appendChild(el('caption', { cls: 'sr-only', text: 'Hotel nights and nightly rate' }));
  var ch = el('tr');
  ['Hotel', 'Nights', 'Rate per room per night (USD)', 'Guests sharing the room', 'Budget check', 'Subtotal per person'].forEach(function (t) { ch.appendChild(el('th', { text: t, attrs: { scope: 'col' } })); });
  calcTable.appendChild(el('thead', null, [ch]));
  var calcBody = el('tbody');
  var calcRefs = {};
  (D.hotels || []).forEach(function (h) {
    var nI = el('input', { cls: 'select budget-input', attrs: { type: 'number', min: '0', step: '1', 'aria-label': 'Nights at ' + h.name } });
    var rI = el('input', { cls: 'select budget-input', attrs: { type: 'number', min: '0', step: '1', 'aria-label': 'Nightly rate at ' + h.name } });
    var gI = el('input', { cls: 'select budget-input', attrs: { type: 'number', min: '1', max: '4', step: '1', 'aria-label': 'Guests sharing the room at ' + h.name } });
    var cap = el('td'), sub = el('td');
    nI.addEventListener('input', function () { state.picks[h.id].nights = Math.floor(num(nI.value)); update(); });
    rI.addEventListener('input', function () { state.picks[h.id].rate = num(rI.value); update(); });
    gI.addEventListener('input', function () { state.picks[h.id].guests = Math.min(4, Math.max(1, Math.floor(num(gI.value, 1)) || 1)); update(); });
    calcRefs[h.id] = { n: nI, r: rI, g: gI, cap: cap, sub: sub };
    calcBody.appendChild(el('tr', null, [
      el('th', { text: h.name + ' (' + h.city + ')', attrs: { scope: 'row' } }),
      el('td', null, [nI]), el('td', null, [rI]), el('td', null, [gI]), cap, sub
    ]));
  });
  calcTable.appendChild(calcBody);
  calcWrap.appendChild(calcTable);
  calc.appendChild(calcWrap);
  var calcSummary = el('p', { cls: 'small', attrs: { role: 'status' } });
  calc.appendChild(calcSummary);
  host.appendChild(calc);

  /* budget table */
  var tWrap = el('div', { cls: 'table-scroll' });
  var table = el('table', { cls: 'compare-table budget-table' });
  table.appendChild(el('caption', { cls: 'sr-only', text: 'Budget rows with quantity, unit cost and total in USD' }));
  var hr = el('tr');
  ['Category', 'Status', 'Qty', 'Unit cost (USD)', 'Total per person', 'Notes'].forEach(function (t) { hr.appendChild(el('th', { text: t, attrs: { scope: 'col' } })); });
  table.appendChild(el('thead', null, [hr]));
  var tbody = el('tbody');
  var rowRefs = {};
  D.budget.forEach(function (r) {
    var q = el('input', { cls: 'select budget-input', attrs: { type: 'number', min: '0', step: '1', 'aria-label': r.category + ' quantity (' + r.unit + ')' } });
    var u = el('input', { cls: 'select budget-input', attrs: { type: 'number', min: '0', step: '1', 'aria-label': r.category + ' unit cost in USD' } });
    q.addEventListener('input', function () { state.rows[r.id].qty = num(q.value); update(); });
    u.addEventListener('input', function () { state.rows[r.id].unitUsd = num(u.value); update(); });
    var totalCell = el('td', { cls: 'num' });
    var note = el('td', { cls: 'small' });
    note.appendChild(document.createTextNode(r.note || ''));
    if (r.sourceUrl) { note.appendChild(document.createTextNode(' ')); note.appendChild(el('a', { text: 'Source', attrs: { href: r.sourceUrl, target: '_blank', rel: 'noopener noreferrer' } })); }
    if (r.excludeFromTotals) note.appendChild(el('strong', { text: ' Not in the fixed total until an amount is entered.' }));
    rowRefs[r.id] = { q: q, u: u, total: totalCell };
    tbody.appendChild(el('tr', null, [
      el('th', { attrs: { scope: 'row' } }, [document.createTextNode(r.category), el('br'), el('span', { cls: 'small', text: r.unit })]),
      el('td', null, [V.statusBadge(r.status)]),
      el('td', null, [q]), el('td', null, [u]), totalCell, note
    ]));
  });
  table.appendChild(tbody);
  var tfoot = el('tfoot');
  var fPer = el('td', { cls: 'num' }), fGrp = el('td', { cls: 'num' }), fVnd = el('td', { cls: 'num' });
  tfoot.appendChild(el('tr', null, [el('th', { text: 'Fixed total per person', attrs: { scope: 'row', colspan: '4' } }), fPer, el('td')]));
  tfoot.appendChild(el('tr', null, [el('th', { attrs: { scope: 'row', colspan: '4' }, text: 'Group total' }), fGrp, el('td')]));
  tfoot.appendChild(el('tr', null, [el('th', { attrs: { scope: 'row', colspan: '4' }, text: 'Group total in VND (at the rate above)' }), fVnd, el('td')]));
  table.appendChild(tfoot);
  tWrap.appendChild(table);
  host.appendChild(tWrap);
  var summaryLive = el('p', { cls: 'budget-summary', attrs: { role: 'status', 'aria-live': 'polite' } });
  host.appendChild(summaryLive);

  /* actions */
  var msg = el('p', { cls: 'small', attrs: { role: 'status' } });
  var actions = el('div', { cls: 'accordion-tools' }, [
    el('button', { cls: 'btn btn-outline', text: 'Save budget', attrs: { type: 'button' }, on: { click: function () { persist(); msg.textContent = 'Budget saved on this device.'; } } }),
    el('button', { cls: 'btn btn-outline', text: 'Reset to defaults', attrs: { type: 'button' }, on: { click: function () {
      state = defaults(); persist(); sync(); update(); msg.textContent = 'Budget reset to the default figures.'; } } }),
    el('button', { cls: 'btn btn-outline', text: 'Export CSV', attrs: { type: 'button' }, on: { click: exportCsv } }),
    el('button', { cls: 'btn btn-outline', text: 'Print', attrs: { type: 'button' }, on: { click: function () { window.print(); } } })
  ]);
  host.appendChild(actions);
  host.appendChild(msg);

  /* chart */
  var chartBox = el('div', { cls: 'budget-chart' });
  host.appendChild(el('h3', { text: 'Where the money goes' }));
  host.appendChild(chartBox);
  var chartTable = el('details', { cls: 'budget-calc' });
  chartTable.appendChild(el('summary', { text: 'Chart data as a table' }));
  var ctBody = el('tbody');
  var ct = el('table', { cls: 'compare-table' }, [el('caption', { cls: 'sr-only', text: 'Budget share by category' }),
    el('thead', null, [el('tr', null, [el('th', { text: 'Category', attrs: { scope: 'col' } }), el('th', { text: 'Per person', attrs: { scope: 'col' } }), el('th', { text: 'Share', attrs: { scope: 'col' } })])]), ctBody]);
  chartTable.appendChild(el('div', { cls: 'table-scroll' }, [ct]));
  host.appendChild(chartTable);

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function drawChart(items, total) {
    chartBox.textContent = '';
    ctBody.textContent = '';
    if (!items.length || total <= 0) {
      chartBox.appendChild(el('p', { cls: 'small', text: 'Enter amounts to see the chart. Every row without a quote is currently $0.' }));
      return;
    }
    var label = 'Donut chart of the fixed budget per person, ' + money(total) + ' in total: ' + items.map(function (i) { return i.name + ' ' + Math.round(i.value / total * 100) + ' percent'; }).join(', ');
    var s = svg('svg', { viewBox: '0 0 200 200', role: 'img', 'aria-label': label, class: 'budget-donut' });
    var R = 70, C = 2 * Math.PI * R, off = 0;
    s.appendChild(svg('circle', { cx: 100, cy: 100, r: R, fill: 'none', stroke: 'rgba(0,0,0,0.08)', 'stroke-width': 34 }));
    items.forEach(function (it) {
      var len = it.value / total * C;
      s.appendChild(svg('circle', { cx: 100, cy: 100, r: R, fill: 'none', stroke: it.color, 'stroke-width': 34,
        'stroke-dasharray': len + ' ' + (C - len), 'stroke-dashoffset': -off, transform: 'rotate(-90 100 100)' }));
      off += len;
    });
    var tx = svg('text', { x: 100, y: 104, 'text-anchor': 'middle', 'font-size': 16, fill: 'currentColor', 'font-family': 'Georgia,serif' });
    tx.textContent = money(total);
    s.appendChild(tx);
    var legend = el('ul', { cls: 'budget-legend' });
    items.forEach(function (it) {
      var pct = Math.round(it.value / total * 1000) / 10;
      var sw = el('span', { cls: 'budget-swatch', attrs: { 'aria-hidden': 'true' } });
      sw.style.background = it.color;
      legend.appendChild(el('li', null, [sw, document.createTextNode(it.name + ': ' + money(it.value) + ' (' + pct + '%)')]));
      ctBody.appendChild(el('tr', null, [el('th', { text: it.name, attrs: { scope: 'row' } }), el('td', { text: money(it.value) }), el('td', { text: pct + '%' })]));
    });
    chartBox.appendChild(s);
    chartBox.appendChild(legend);
  }

  /* ---------- update/sync ---------- */
  function sync() {
    travInput.value = state.travellers;
    rateInput.value = state.vnd;
    D.budget.forEach(function (r) { rowRefs[r.id].q.value = state.rows[r.id].qty; rowRefs[r.id].u.value = state.rows[r.id].unitUsd; });
    Object.keys(calcRefs).forEach(function (id) { calcRefs[id].n.value = state.picks[id].nights; calcRefs[id].r.value = state.picks[id].rate; calcRefs[id].g.value = state.picks[id].guests; });
  }
  function update() {
    var fixed = 0, items = [], idx = 0;
    D.budget.forEach(function (r) {
      var v = rowValues(r), ref = rowRefs[r.id];
      ref.q.disabled = v.locked; ref.u.disabled = v.locked;
      if (v.locked) { ref.q.value = v.qty; ref.u.value = Math.round(v.unit * 100) / 100; }
      var excluded = r.excludeFromTotals && v.total === 0;
      ref.total.textContent = excluded ? 'Not entered' : money(v.total);
      if (!excluded) fixed += v.total;
      if (!excluded && v.total > 0) items.push({ name: r.category, value: v.total, color: COLORS[idx % COLORS.length] });
      idx++;
    });
    var group = fixed * state.travellers;
    fPer.textContent = money(fixed);
    fGrp.textContent = money(group);
    fVnd.textContent = vnd(group);
    var pending = D.budget.filter(function (r) { return r.status === 'proposed' && !r.excludeFromTotals && rowValues(r).total === 0; }).length;
    summaryLive.textContent = 'Fixed total per person ' + money(fixed) + ', group of ' + state.travellers + ' ' + money(group) + ' (' + vnd(group) + '). ' + pending + ' rows are still at $0 until you add a quote, so the real total will be higher.';
    var h = hotelNights();
    Object.keys(calcRefs).forEach(function (id) {
      var p = state.picks[id], c = calcRefs[id];
      c.cap.textContent = p.nights === 0 ? 'Not selected' : (p.rate <= CAP ? 'Within the $' + CAP + ' target' : (p.guests > 1 ? 'Shared by ' + p.guests + ': ' + money(p.rate / p.guests) + ' per person per night' : 'Over the $' + CAP + ' target'));
      c.sub.textContent = money(p.nights * p.rate / p.guests);
    });
    var over = Object.keys(state.picks).filter(function (id) { return state.picks[id].nights > 0 && state.picks[id].rate > CAP && state.picks[id].guests < 2; }).length;
    calcSummary.textContent = h.nights === 0
      ? 'No hotels selected. The Hotels row uses its manual Estimated figure.'
      : h.nights + ' nights selected, ' + money(h.total) + ' per person, average ' + money(h.total / h.nights) + ' per night' + (over ? '. ' + over + ' hotel(s) above the target and not shared.' : ', within the target or shared.') + ' Stay length plan: Da Nang ' + ((DEF.hotelNights || {})['Da Nang'] || 3) + ' nights, Ho Chi Minh City ' + ((DEF.hotelNights || {})['Ho Chi Minh City'] || 5) + ' nights.';
    drawChart(items, fixed);
    persist();
  }

  /* ---------- CSV ---------- */
  function csvCell(v) {
    var s = String(v === null || v === undefined ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // avoid spreadsheet formula injection
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function exportCsv() {
    var lines = [['Category', 'Status', 'Qty', 'Unit', 'Unit cost USD', 'Total per person USD', 'Note'].map(csvCell).join(',')];
    var fixed = 0;
    D.budget.forEach(function (r) {
      var v = rowValues(r);
      var excluded = r.excludeFromTotals && v.total === 0;
      if (!excluded) fixed += v.total;
      lines.push([r.category, r.status, v.qty, r.unit, Math.round(v.unit * 100) / 100, excluded ? 'not entered' : v.total, r.note].map(csvCell).join(','));
    });
    lines.push(['Fixed total per person', '', '', '', '', fixed, ''].map(csvCell).join(','));
    lines.push(['Travellers', '', state.travellers, '', '', '', ''].map(csvCell).join(','));
    lines.push(['Group total USD', '', '', '', '', fixed * state.travellers, ''].map(csvCell).join(','));
    lines.push(['VND per USD', '', '', '', state.vnd, '', 'Default rate as of ' + (FX.asOf || '')].map(csvCell).join(','));
    lines.push(['Planning estimates only. Not a booking or price guarantee.'].map(csvCell).join(','));
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'vietnam-option-2-budget.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    msg.textContent = 'CSV downloaded.';
  }

  travInput.addEventListener('input', function () { state.travellers = Math.max(1, Math.floor(num(travInput.value, 1)) || 1); update(); });
  rateInput.addEventListener('input', function () { state.vnd = num(rateInput.value) || FX.vndPerUsd || 0; update(); });
  sync();
  update();
})();

/* Section renderers for hotels, dining, nightlife, cafes, shopping and wellness.
   Uses window.VO2 helpers from app.js. Data strings are rendered with textContent only.
   Fields without a published value (null) are left out of the card. */
(function () {
  'use strict';

  var VO2 = window.VO2;
  if (!VO2) return;
  var D = VO2.data || {};
  var el = VO2.el;
  var PENDING = '';

  /* ---------- shared helpers ---------- */
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function list(x) { return Array.isArray(x) ? x : []; }

  /* Turn a populated card grid into the SAME horizontal day-cell scroller used for
     the itinerary (reuses VO2.buildDayScroller + the .day-scroller CSS). The grid
     element itself becomes the .day-scroller-track row; each card becomes a cell.
     cardSelector tells the scroller which children are cells (default '.card'). */
  function scrollerize(grid, cardSelector) {
    if (!grid || !VO2.buildDayScroller) return;
    var cards = grid.querySelectorAll(cardSelector || '.card');
    for (var i = 0; i < cards.length; i++) {
      if (!cards[i].hasAttribute('tabindex')) cards[i].setAttribute('tabindex', '0');
    }
    VO2.buildDayScroller(grid, VO2.reducedMotion, cardSelector || '.card');
  }

  /* Fact values may be a string, an object with .text, or null. */
  function factText(x) {
    if (x === null || x === undefined) return null;
    if (typeof x === 'string') return x;
    return x.text || null;
  }
  function factStatus(x) {
    return x && typeof x === 'object' && x.status ? x.status : null;
  }

  function extLink(label, url, cls) {
    return el('a', { cls: cls || 'ext-link', attrs: { href: url, target: '_blank', rel: 'noopener noreferrer' } }, [
      document.createTextNode(label),
      el('span', { cls: 'sr-only', text: ' (opens in a new tab)' })
    ]);
  }
  function dashEl() { return el('span', { cls: 'muted-dash', text: '—', attrs: { 'aria-label': 'No published value' } }); }

  /* Instagram link showing @handle, derived from the URL's last path segment, linking the full URL.
     Reuses extLink so target=_blank rel="noopener noreferrer" are set. Returns null when no url. */
  function igLink(url) {
    if (!url) return null;
    var seg = String(url).replace(/[?#].*$/, '').replace(/\/+$/, '');
    var parts = seg.split('/');
    var handle = parts[parts.length - 1] || '';
    return extLink('@' + handle, url);
  }

  /* ---------- booking / reservation / inquiry links ----------
     Each record may carry bookingLinks: [{ kind: 'book'|'reserve'|'inquire', via: 'official'|'ota', otaName, url, check, note }].
     Only https links are rendered. With no link the card shows a short how-to-reserve line. */
  var KIND_LABEL = { book: 'Book', reserve: 'Reserve', inquire: 'Inquire' };
  function viaText(l) {
    if (l.via === 'ota') return (l.otaName || 'travel site') + ' listing';
    if (l.via === 'chat') return l.chatName || 'WhatsApp';
    if (l.via === 'maps') return 'Google Maps listing';
    if (l.via === 'social') return l.socialName || 'social page';
    return 'official site';
  }
  function bookLinks(rec) {
    return list(rec && rec.bookingLinks).filter(function (l) {
      return l && KIND_LABEL[l.kind] && typeof l.url === 'string' && /^https:\/\//.test(l.url);
    });
  }
  function bookBtn(rec, l) {
    var cls = l.kind === 'inquire' ? 'btn btn-outline btn-sm book-btn' : 'btn btn-gold btn-sm book-btn';
    return el('a', { cls: cls, attrs: { href: l.url, target: '_blank', rel: 'noopener noreferrer' } }, [
      document.createTextNode(KIND_LABEL[l.kind]),
      el('span', { cls: 'sr-only', text: ' ' + rec.name + ' (' + viaText(l) + ', opens in a new tab)' }),
      el('span', { cls: 'book-via', text: viaText(l), attrs: { 'aria-hidden': 'true' } })
    ]);
  }
  /* Returns a block of booking buttons, or a short how-to-reserve line. */
  function bookBlock(rec) {
    var links = bookLinks(rec);
    var box = el('div', { cls: 'book-cta' });
    if (!links.length) {
      box.appendChild(el('span', { cls: 'book-pending', text: 'Reserve by contacting the venue directly; use the Map link for its address.' }));
      return box;
    }
    var row = el('div', { cls: 'link-row book-row' });
    links.forEach(function (l) { row.appendChild(bookBtn(rec, l)); });
    box.appendChild(row);
    var notes = links.filter(function (l) { return l.note; }).map(function (l) { return KIND_LABEL[l.kind] + ' (' + viaText(l) + '): ' + l.note; });
    if (notes.length) box.appendChild(el('p', { cls: 'fine-print', text: notes.join(' ') }));
    return box;
  }
  function bookInline(rec) {
    var links = bookLinks(rec);
    if (!links.length) return null;
    var span = el('span', { cls: 'book-inline' });
    links.forEach(function (l, i) {
      if (i) span.appendChild(document.createTextNode(' · '));
      span.appendChild(extLink(KIND_LABEL[l.kind] + ' (' + viaText(l) + ')', l.url));
    });
    return span;
  }
  function linkNotice() {
    return el('p', { cls: 'notice link-notice', text: 'Book, Reserve and Inquire buttons lead to external sites. Rates and availability for November 2027 must be checked there. Nothing on this site is booked, and a link is not a confirmed booking.' });
  }

  /* A definition-list row; value may be a string, a Node, or null (the row is left out). */
  function addRow(dl, label, value, status) {
    if (value === null || value === undefined || value === '') return;
    dl.appendChild(el('dt', { text: label }));
    var dd = el('dd');
    if (typeof value === 'string') dd.appendChild(document.createTextNode(value));
    else dd.appendChild(value);
    if (status && status !== 'verified') { dd.appendChild(document.createTextNode(' ')); dd.appendChild(VO2.statusBadge(status)); }
    else if (status === 'verified') { dd.appendChild(document.createTextNode(' ')); dd.appendChild(VO2.statusBadge('verified')); }
    dl.appendChild(dd);
  }

  function mapUrl(refId, query) {
    var pts = list(D.mappoints);
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].refId === refId && pts[i].googleMapsUrl) return pts[i].googleMapsUrl;
    }
    if (query) return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
    return null;
  }
  function mapLinkNode(refId, query) {
    var u = mapUrl(refId, query);
    return u ? extLink('Open in Google Maps', u) : null;
  }

  function cardShell(rec, extraCls) {
    var card = el('article', { cls: 'card dir-card' + (extraCls ? ' ' + extraCls : ''), attrs: { 'data-id': rec.id, tabindex: '0' } });
    var media = el('div', { cls: 'card-media' }, [VO2.imageEl(rec.image, rec.imageAlt || '')]);
    if (rec.imageNote) media.appendChild(el('p', { cls: 'img-caption', text: rec.imageNote }));
    card.appendChild(media);
    card.appendChild(VO2.heartButton(rec.id, rec.name));
    return card;
  }

  function liveCount(id) {
    return el('p', { cls: 'result-count', attrs: { id: id, role: 'status', 'aria-live': 'polite' } });
  }
  function emptyState(text) { return el('p', { cls: 'empty-state', text: text }); }

  /* Single-select chip group (aria-pressed). */
  function chipGroup(legend, options, current, onPick) {
    var fs = el('fieldset', { cls: 'filter-group' }, [el('legend', { text: legend })]);
    var row = el('div', { cls: 'chip-row' });
    var buttons = options.map(function (o) {
      var b = el('button', { cls: 'chip', text: o.label, attrs: { type: 'button', 'aria-pressed': String(o.value === current()), 'data-value': String(o.value) } });
      b.addEventListener('click', function () {
        onPick(o.value);
        buttons.forEach(function (x, i) { x.setAttribute('aria-pressed', String(options[i].value === current())); });
      });
      row.appendChild(b);
      return b;
    });
    fs.appendChild(row);
    fs.sync = function () { buttons.forEach(function (x, i) { x.setAttribute('aria-pressed', String(options[i].value === current())); }); };
    return fs;
  }
  /* Toggle chip (aria-pressed). */
  function toggleChip(label, isOn, onToggle) {
    var b = el('button', { cls: 'chip', text: label, attrs: { type: 'button', 'aria-pressed': String(isOn()) } });
    b.addEventListener('click', function () { onToggle(!isOn()); b.setAttribute('aria-pressed', String(isOn())); });
    b.sync = function () { b.setAttribute('aria-pressed', String(isOn())); };
    return b;
  }

  /* Accessible city tabs (role=tablist) with arrow-key navigation. */
  function buildTabs(idPrefix, tabs, onSelect) {
    var wrap = el('div', { cls: 'tabs' });
    var bar = el('div', { cls: 'tablist', attrs: { role: 'tablist', 'aria-label': 'Choose a city' } });
    var panels = [];
    var btns = tabs.map(function (t, i) {
      var b = el('button', { cls: 'tab', text: t.label, attrs: {
        type: 'button', role: 'tab', id: idPrefix + '-tab-' + i, 'aria-controls': idPrefix + '-panel-' + i,
        'aria-selected': String(i === 0), tabindex: i === 0 ? '0' : '-1' } });
      b.addEventListener('click', function () { select(i, false); });
      b.addEventListener('keydown', function (e) {
        var n = btns.length, k = null;
        if (e.key === 'ArrowRight') k = (i + 1) % n;
        else if (e.key === 'ArrowLeft') k = (i - 1 + n) % n;
        else if (e.key === 'Home') k = 0;
        else if (e.key === 'End') k = n - 1;
        if (k !== null) { e.preventDefault(); select(k, true); }
      });
      bar.appendChild(b);
      var p = el('div', { cls: 'tabpanel', attrs: { role: 'tabpanel', id: idPrefix + '-panel-' + i, 'aria-labelledby': idPrefix + '-tab-' + i, tabindex: '0' } });
      if (i !== 0) p.setAttribute('hidden', '');
      panels.push(p);
      return b;
    });
    function select(i, focus) {
      btns.forEach(function (b, k) {
        b.setAttribute('aria-selected', String(k === i));
        b.setAttribute('tabindex', k === i ? '0' : '-1');
        if (k === i) panels[k].removeAttribute('hidden'); else panels[k].setAttribute('hidden', '');
      });
      if (focus) btns[i].focus();
      if (onSelect) onSelect(i);
    }
    wrap.appendChild(bar);
    panels.forEach(function (p) { wrap.appendChild(p); });
    return { root: wrap, panels: panels };
  }

  /* ================= HOTELS ================= */
  (function hotels() {
    var body = document.getElementById('hotelsBody');
    var all = list(D.hotels);
    if (!body) return;
    if (!all.length) { body.appendChild(emptyState('Hotel details are being updated.')); return; }
    var meta = D.hotelsMeta || { capUsdPerNight: 170, nights: { 'Da Nang': 3, 'Ho Chi Minh City': 5 } };
    var cap = meta.capUsdPerNight || 170;
    var MAX_COMPARE = 3;

    var softCities = list(meta.softCapCities);
    var shareGuests = (meta.sharedRoom && meta.sharedRoom.guests) || 2;
    var shareLabel = (meta.sharedRoom && meta.sharedRoom.label) || ('Over $' + cap + ' budget \u2014 share a room to split the cost');
    var state = { city: 'all', max: Infinity, stars: 'any', pool: false, spa: false, area: 'any', budget: 'all' };
    var compare = list(VO2.load('vo2_compare', [])).filter(function (id) {
      return all.some(function (h) { return h.id === id; });
    }).slice(0, MAX_COMPARE);

    body.appendChild(el('p', { cls: 'lead', text: 'Target $' + cap + ' USD per room per night. Da Nang beachfront hotels above that can be shared by ' + shareGuests + ' guests to split the cost. Nights: Da Nang ' + meta.nights['Da Nang'] + ', Ho Chi Minh City ' + meta.nights['Ho Chi Minh City'] + '.' }));
    body.appendChild(el('p', { cls: 'notice', text: meta.rateNote || 'Nightly rates are estimates. Confirm with each hotel.' }));
    body.appendChild(linkNotice());

    /* filters */
    var bar = el('div', { cls: 'filter-bar hotel-filters', attrs: { role: 'group', 'aria-label': 'Hotel filters' } });
    var cityG = chipGroup('City', [{ value: 'all', label: 'All cities' }, { value: 'Da Nang', label: 'Da Nang' }, { value: 'Ho Chi Minh City', label: 'Ho Chi Minh City' }],
      function () { return state.city; }, function (v) { state.city = v; render(); });
    var starsG = chipGroup('Star class', [{ value: 'any', label: 'Any' }, { value: '4', label: '4 stars or more' }, { value: '5', label: '5 stars' }],
      function () { return state.stars; }, function (v) { state.stars = v; render(); });
    var areaG = chipGroup('Location', [{ value: 'any', label: 'Any' }, { value: 'beach', label: 'Beachfront' }, { value: 'd1', label: 'District 1' }],
      function () { return state.area; }, function (v) { state.area = v; render(); });
    var budgetG = chipGroup('Budget', [{ value: 'all', label: 'All' }, { value: 'within', label: 'Within budget' }, { value: 'shared', label: 'Shared room (over budget)' }],
      function () { return state.budget; }, function (v) { state.budget = v; render(); });
    var amen = el('fieldset', { cls: 'filter-group' }, [el('legend', { text: 'Amenities' })]);
    var amenRow = el('div', { cls: 'chip-row' });
    var poolChip = toggleChip('Pool', function () { return state.pool; }, function (v) { state.pool = v; render(); });
    var spaChip = toggleChip('Spa', function () { return state.spa; }, function (v) { state.spa = v; render(); });
    amenRow.appendChild(poolChip); amenRow.appendChild(spaChip); amen.appendChild(amenRow);

    var priceWrap = el('div', { cls: 'filter-group' });
    priceWrap.appendChild(el('label', { text: 'Max nightly price', attrs: { for: 'hotelMaxPrice' } }));
    var priceSel = el('select', { cls: 'select', attrs: { id: 'hotelMaxPrice' } });
    priceSel.appendChild(el('option', { text: 'Any price', attrs: { value: 'any' } }));
    [cap, 150, 120, 100].forEach(function (v) {
      priceSel.appendChild(el('option', { text: 'Up to $' + v + ' per night' + (v === cap ? ' (target)' : ''), attrs: { value: String(v) } }));
    });
    priceSel.addEventListener('change', function () { state.max = priceSel.value === 'any' ? Infinity : Number(priceSel.value); render(); });
    priceWrap.appendChild(priceSel);

    var resetBtn = el('button', { cls: 'btn btn-outline', text: 'Reset filters', attrs: { type: 'button' } });
    resetBtn.addEventListener('click', function () {
      state = { city: 'all', max: Infinity, stars: 'any', pool: false, spa: false, area: 'any', budget: 'all' };
      priceSel.value = 'any';
      [cityG, starsG, areaG, budgetG].forEach(function (g) { g.sync(); });
      poolChip.sync(); spaChip.sync();
      render();
    });
    [cityG, budgetG, priceWrap, starsG, amen, areaG].forEach(function (n) { bar.appendChild(n); });
    bar.appendChild(resetBtn);
    body.appendChild(bar);

    var count = liveCount('hotelCount');
    body.appendChild(count);
    var grid = el('div', { cls: 'grid hotel-grid' });
    body.appendChild(grid);

    var compareMsg = el('p', { cls: 'compare-msg', attrs: { id: 'compareMsg', role: 'status', 'aria-live': 'polite' } });
    var comparePanel = el('div', { cls: 'compare-panel', attrs: { id: 'hotelCompare' } });
    body.appendChild(el('h3', { text: 'Compare hotels side by side' }));
    body.appendChild(el('p', { cls: 'lead', text: 'Tick "Compare" on up to ' + MAX_COMPARE + ' hotels.' }));
    body.appendChild(compareMsg);
    body.appendChild(comparePanel);

    function nightly(h) { return h.rate && typeof h.rate.planningUsd === 'number' ? h.rate.planningUsd : null; }
    function nights(h) { return meta.nights[h.city] || null; }
    function totalOf(h) { var n = nightly(h), t = nights(h); return n !== null && t ? n * t : null; }

    function usd2(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(n); }
    function isShared(h) { var n = nightly(h); return n !== null && n > cap && softCities.indexOf(h.city) !== -1; }
    function perPerson(h) { var n = nightly(h), t = nights(h); return n === null ? null : { night: n / shareGuests, stay: t ? n / shareGuests * t : null }; }

    function matches(h) {
      if (state.city !== 'all' && h.city !== state.city) return false;
      var p = nightly(h);
      if (p !== null && p > state.max) return false;
      if (state.budget === 'within' && p !== null && p > cap) return false;
      if (state.budget === 'shared' && !isShared(h)) return false;
      if (state.stars !== 'any' && !(typeof h.stars === 'number' && h.stars >= Number(state.stars))) return false;
      if (state.stars === '5' && h.stars !== 5) return false;
      if (state.pool && h.pool !== true) return false;
      if (state.spa && h.spa !== true) return false;
      if (state.area === 'beach' && !h.beachfront) return false;
      if (state.area === 'd1' && !h.district1) return false;
      return true;
    }

    function priceNodes(h) {
      var n = nightly(h), t = totalOf(h), box = el('div', { cls: 'price-box' });
      if (n === null) {
        box.appendChild(el('p', { cls: 'price-line', text: 'Rates vary by night; check the booking links or the official site for November 2027.' }));
        return box;
      }
      var over = n > cap;
      box.appendChild(el('p', { cls: 'price-line' }, [
        el('strong', { text: 'Estimated nightly rate: ' }), document.createTextNode(VO2.fmtUSD(n) + ' '), VO2.statusBadge(h.rate.status || 'estimated')
      ]));
      box.appendChild(el('p', { cls: 'price-line' }, [
        el('strong', { text: 'Total stay (' + nights(h) + ' nights): ' }), document.createTextNode(VO2.fmtUSD(t))
      ]));
      if (isShared(h)) {
        var pp = perPerson(h);
        box.appendChild(el('p', { cls: 'shared-flag', text: shareLabel }));
        box.appendChild(el('p', { cls: 'price-line' }, [
          el('strong', { text: 'Per person sharing (' + shareGuests + ' guests): ' }),
          document.createTextNode(usd2(pp.night) + ' per night' + (pp.stay !== null ? ', ' + usd2(pp.stay) + ' for ' + nights(h) + ' nights' : ''))
        ]));
      } else if (over) box.appendChild(el('p', { cls: 'cap-flag', text: 'Above the $' + cap + ' per night cap' }));
      if (h.rate.note) box.appendChild(el('p', { cls: 'fine-print', text: h.rate.note }));
      if (h.observedRate && h.observedRate.text) {
        box.appendChild(el('p', { cls: 'fine-print' }, [
          document.createTextNode(h.observedRate.text + ' '),
          h.observedRate.sourceUrl ? extLink('Source', h.observedRate.sourceUrl) : null
        ]));
      }
      return box;
    }

    function starsText(h) {
      if (typeof h.stars !== 'number') return null;
      var label = h.stars + '-star';
      if (h.starsStatus === 'verified') return label + ' (verified on the hotel\'s site)';
      return label + ' (per booking listings)';
    }
    function triState(v) { return v === true ? 'Yes' : (v === false ? 'No' : null); }
    function reviewNode(h) {
      var r = h.review;
      if (!r || (r.score === null && !r.basis)) return null;
      var parts = [];
      if (r.score !== null && r.score !== undefined) parts.push(r.score + '/' + (r.scale || 10));
      if (r.basis) parts.push(r.basis);
      var node = el('span', {}, [document.createTextNode(parts.join('. ') + '. Source: ' + (r.source || 'listing') + (r.date ? ', checked ' + r.date : '') + '. ')]);
      if (r.sourceUrl) node.appendChild(extLink('View source', r.sourceUrl));
      return node;
    }
    function distNode(h) {
      var ul = el('ul', { cls: 'plain-list' });
      list(h.distances).forEach(function (d) {
        if (d.value) ul.appendChild(el('li', {}, [document.createTextNode(d.to + ': '), document.createTextNode(d.value)]));
      });
      return ul.children.length ? ul : null;
    }
    function beachNode(h) {
      if (!h.beachfrontNote) return null;
      var node = el('span', {}, [document.createTextNode(h.beachfrontNote + ' ')]);
      if (h.beachfrontSourceUrl) node.appendChild(extLink('View source', h.beachfrontSourceUrl));
      return node;
    }
    function areaText(h) { return h.beachfront ? 'Beachfront' : (h.district1 ? 'District 1' : null); }

    /* No hotel in the data has an own/verified photo of itself (every image is a
       context/area photo, and the four Da Nang hotels all share one beach asset).
       To avoid reusing another hotel's photo, each hotel card gets a neutral,
       palette-matched CSS placeholder labelled with the hotel name. */
    function hotelCard(h) {
      var card = el('article', { cls: 'card dir-card', attrs: { 'data-id': h.id, tabindex: '0' } });
      var media = el('div', { cls: 'card-media' });
      var ph = el('div', { cls: 'media-placeholder', attrs: { role: 'img', 'aria-label': h.name } });
      ph.appendChild(el('span', { cls: 'media-placeholder-text', text: h.name, attrs: { 'aria-hidden': 'true' } }));
      media.appendChild(ph);
      card.appendChild(media);
      card.appendChild(VO2.heartButton(h.id, h.name));
      var body = el('div', { cls: 'card-body' });
      body.appendChild(el('p', { cls: 'card-city', text: h.city + (h.neighborhood ? ' · ' + h.neighborhood : '') }));
      body.appendChild(el('h3', { text: h.name }));
      var dl = el('dl', { cls: 'facts' });
      addRow(dl, 'Star classification', starsText(h));
      if (h.starsNote) addRow(dl, 'Star note', h.starsNote);
      addRow(dl, 'Beach access', beachNode(h));
      addRow(dl, 'Pool', triState(h.pool));
      addRow(dl, 'Spa', triState(h.spa));
      addRow(dl, 'Amenities', list(h.amenities).length ? list(h.amenities).join('; ') : null);
      addRow(dl, 'Distances', distNode(h));
      addRow(dl, 'Guest reviews', reviewNode(h));
      addRow(dl, 'Instagram', igLink(h.instagram));
      body.appendChild(dl);
      body.appendChild(priceNodes(h));
      if (h.roomNote) body.appendChild(el('p', { cls: 'fine-print', text: h.roomNote }));
      var links = el('div', { cls: 'link-row' });
      if (h.officialUrl) links.appendChild(extLink('Official website', h.officialUrl, 'btn btn-outline btn-sm'));
      body.appendChild(links);
      body.appendChild(bookBlock(h));
      var cmp = el('label', { cls: 'compare-check' });
      var cb = el('input', { attrs: { type: 'checkbox', 'data-compare': h.id } });
      cb.checked = compare.indexOf(h.id) !== -1;
      cb.addEventListener('change', function () { toggleCompare(h.id, cb); });
      cmp.appendChild(cb);
      cmp.appendChild(document.createTextNode(' Compare ' + h.name));
      body.appendChild(cmp);
      card.appendChild(body);
      return card;
    }

    function toggleCompare(id, cb) {
      var i = compare.indexOf(id);
      if (cb.checked) {
        if (i === -1) {
          if (compare.length >= MAX_COMPARE) {
            cb.checked = false;
            compareMsg.textContent = 'You can compare up to ' + MAX_COMPARE + ' hotels. Remove one to add another.';
            return;
          }
          compare.push(id);
        }
      } else if (i !== -1) compare.splice(i, 1);
      compareMsg.textContent = '';
      afterCompareChange();
    }
    function afterCompareChange() {
      VO2.save('vo2_compare', compare);
      var boxes = body.querySelectorAll('input[data-compare]');
      for (var i = 0; i < boxes.length; i++) boxes[i].checked = compare.indexOf(boxes[i].getAttribute('data-compare')) !== -1;
      renderCompare();
    }

    function renderCompare() {
      clear(comparePanel);
      var chosen = compare.map(function (id) { return all.filter(function (h) { return h.id === id; })[0]; }).filter(Boolean);
      comparePanel.appendChild(el('p', { cls: 'compare-count', text: chosen.length + ' of ' + MAX_COMPARE + ' hotels selected.' }));
      if (chosen.length < 2) {
        comparePanel.appendChild(emptyState('Select at least two hotels to see them side by side.'));
        if (!chosen.length) return;
      }
      var scroll = el('div', { cls: 'table-scroll', attrs: { tabindex: '0', role: 'region', 'aria-label': 'Hotel comparison table, scrolls sideways on small screens' } });
      var table = el('table', { cls: 'compare-table' });
      table.appendChild(el('caption', { cls: 'sr-only', text: 'Side-by-side hotel comparison' }));
      var thead = el('thead'), hr = el('tr');
      hr.appendChild(el('th', { text: 'Detail', attrs: { scope: 'col' } }));
      chosen.forEach(function (h) {
        var th = el('th', { attrs: { scope: 'col' } }, [el('span', { text: h.name })]);
        var rm = el('button', { cls: 'btn btn-outline btn-sm', text: 'Remove', attrs: { type: 'button', 'aria-label': 'Remove ' + h.name + ' from comparison' } });
        rm.addEventListener('click', function () { var i = compare.indexOf(h.id); if (i !== -1) compare.splice(i, 1); compareMsg.textContent = ''; afterCompareChange(); });
        th.appendChild(document.createElement('br')); th.appendChild(rm);
        hr.appendChild(th);
      });
      thead.appendChild(hr); table.appendChild(thead);
      var tb = el('tbody');
      function line(label, fn) {
        var tr = el('tr');
        tr.appendChild(el('th', { text: label, attrs: { scope: 'row' } }));
        chosen.forEach(function (h) {
          var td = el('td'), v = fn(h);
          if (v === null || v === undefined || v === '') td.appendChild(dashEl());
          else if (typeof v === 'string') td.textContent = v;
          else td.appendChild(v);
          tr.appendChild(td);
        });
        tb.appendChild(tr);
      }
      line('City', function (h) { return h.city; });
      line('Neighborhood', function (h) { return h.neighborhood; });
      line('Star class', function (h) { return typeof h.stars === 'number' ? starsText(h) : null; });
      line('Estimated nightly rate', function (h) {
        var n = nightly(h);
        return n === null ? null : VO2.fmtUSD(n) + ' (' + (h.rate.status === 'proposed' ? 'Proposed planning figure' : 'Estimated') + ')';
      });
      line('Total stay', function (h) {
        var t = totalOf(h);
        return t === null ? null : VO2.fmtUSD(t) + ' for ' + nights(h) + ' nights (estimated)';
      });
      line('Budget fit', function (h) {
        var n = nightly(h);
        if (n === null) return null;
        if (n <= cap) return 'Within the $' + cap + ' budget';
        return isShared(h) ? shareLabel : 'No, above the $' + cap + ' cap';
      });
      line('Per person if sharing', function (h) {
        if (!isShared(h)) return null;
        var pp = perPerson(h);
        return usd2(pp.night) + ' per night, ' + usd2(pp.stay) + ' for ' + nights(h) + ' nights (' + shareGuests + ' guests sharing)';
      });
      line('Pool', function (h) { return triState(h.pool); });
      line('Spa', function (h) { return triState(h.spa); });
      line('Setting', areaText);
      line('Beach access', beachNode);
      line('Amenities', function (h) { return list(h.amenities).length ? list(h.amenities).join('; ') : null; });
      line('Distances', distNode);
      line('Guest reviews', reviewNode);
      line('Official website', function (h) { return h.officialUrl ? extLink('Official website', h.officialUrl) : null; });
      line('Booking links', function (h) { return bookInline(h); });
      table.appendChild(tb); scroll.appendChild(table); comparePanel.appendChild(scroll);
      var clearBtn = el('button', { cls: 'btn btn-outline', text: 'Clear comparison', attrs: { type: 'button' } });
      clearBtn.addEventListener('click', function () { compare.length = 0; compareMsg.textContent = ''; afterCompareChange(); });
      comparePanel.appendChild(clearBtn);
    }

    function render() {
      clear(grid);
      var shown = all.filter(matches);
      shown.forEach(function (h) { grid.appendChild(hotelCard(h)); });
      if (!shown.length) grid.appendChild(emptyState('No hotels match these filters. Try resetting them.'));
      count.textContent = 'Showing ' + shown.length + ' of ' + all.length + ' hotels';
    }
    render();
    renderCompare();
  })();

  /* ================= DINING ================= */
  (function dining() {
    var body = document.getElementById('diningBody');
    var all = list(D.dining);
    if (!body) return;
    if (!all.length) { body.appendChild(emptyState('Dining details are being updated.')); return; }

    body.appendChild(el('p', { cls: 'notice', text: 'Michelin recognition changes every year. Status shown was checked on the dates in each source; re-check the current Michelin Guide before booking. Nothing here is reserved.' }));
    body.appendChild(linkNotice());

    /* Every dinner "More details" region is registered here so printing (and the
       beforeprint handler below) can force them all open. */
    var detailToggles = [];
    var toggleSeq = 0;

    function michelinBadge(m) {
      if (!m) return null;
      var b = VO2.statusBadge(m.status || 'estimated');
      b.textContent = 'Michelin: ' + b.textContent;
      return b;
    }

    /* Toggle a "More details" region open/closed and keep aria-expanded in sync. */
    function setDetails(btn, region, open) {
      btn.setAttribute('aria-expanded', String(open));
      if (open) region.removeAttribute('hidden'); else region.setAttribute('hidden', '');
    }

    function diningCard(r, featured) {
      var card = cardShell(r, 'dining-card' + (featured ? ' dining-featured' : ''));
      var b = el('div', { cls: 'card-body' });

      /* Header: badges, restaurant name, then one line "city · proposed date". */
      var badges = el('div', { cls: 'badge-row' });
      if (r.proposedDate) badges.appendChild(VO2.statusBadge('proposed'));
      else badges.appendChild(VO2.statusBadge(r.status || 'estimated'));
      var mb = michelinBadge(r.michelin); if (mb) badges.appendChild(mb);
      b.appendChild(badges);
      b.appendChild(el('h3', { text: r.name }));
      b.appendChild(el('p', { cls: 'card-city', text: r.city + (r.proposedDate ? ' · Proposed dinner ' + VO2.formatDate(r.proposedDate) : '') }));

      /* Short description (1-2 lines). */
      if (r.description) b.appendChild(el('p', { cls: 'card-desc', text: r.description }));

      /* Key facts: 2-col desktop / 1-col mobile. */
      var dl = el('dl', { cls: 'facts facts-grid' });
      addRow(dl, 'Cuisine', r.cuisine);
      addRow(dl, 'Location', r.location);
      addRow(dl, 'Hours', factText(r.hours));
      addRow(dl, 'Dress code', factText(r.dressCode));
      b.appendChild(dl);

      /* "More details" expandable: real button + hidden region with the longer text. */
      toggleSeq += 1;
      var regionId = 'dinner-details-' + toggleSeq;
      var toggle = el('button', { cls: 'more-toggle', text: 'More details', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': regionId } });
      var region = el('div', { cls: 'more-details', attrs: { id: regionId } });
      region.setAttribute('hidden', '');
      var ddl = el('dl', { cls: 'facts' });
      if (r.michelin) addRow(ddl, 'Michelin', factText(r.michelin));
      addRow(ddl, 'Menu', factText(r.menu));
      if (r.menu && r.menu.notice) addRow(ddl, 'Menu notice', r.menu.notice);
      addRow(ddl, 'Price estimate', factText(r.priceEstimate), r.priceEstimate ? r.priceEstimate.status : null);
      if (r.deposit) addRow(ddl, 'Reservation terms', factText(r.deposit));
      if (r.accessibility) addRow(ddl, 'Accessibility', r.accessibility);
      addRow(ddl, 'Map', mapLinkNode(r.id, null));
      if (ddl.children.length) region.appendChild(ddl);
      if (r.note) region.appendChild(el('p', { cls: 'fine-print', text: r.note }));
      region.appendChild(bookBlock(r));
      region.appendChild(el('p', { cls: 'fine-print' }, [
        document.createTextNode('Booking status: not booked.' + (r.sourceUrl ? ' Source: ' : '')),
        r.sourceUrl ? extLink('details', r.sourceUrl) : null
      ]));
      toggle.addEventListener('click', function () {
        setDetails(toggle, region, toggle.getAttribute('aria-expanded') !== 'true');
      });
      detailToggles.push({ toggle: toggle, region: region });
      b.appendChild(toggle);
      b.appendChild(region);

      /* Action row: at most one primary action, plus Instagram (only if present).
         The wishlist heart is already on the card media via cardShell. */
      var links = el('div', { cls: 'link-row action-row' });
      var primaryUrl = r.reservationUrl || r.menuUrl;
      if (primaryUrl) links.appendChild(extLink('Official website', primaryUrl, 'btn btn-gold btn-sm'));
      if (r.reservationEmail) links.appendChild(el('a', { cls: 'btn btn-outline btn-sm', text: 'Email to reserve', attrs: { href: 'mailto:' + r.reservationEmail } }));
      var ig = igLink(r.instagram);
      if (ig) { ig.className = 'btn btn-outline btn-sm'; links.appendChild(ig); }
      if (links.children.length) b.appendChild(links);

      card.appendChild(b);
      return card;
    }

    body.appendChild(el('h3', { text: 'Featured dinners' }));
    var feat = el('div', { cls: 'grid card-stack' });
    all.filter(function (r) { return r.featured; }).forEach(function (r) { feat.appendChild(diningCard(r, true)); });
    body.appendChild(feat);

    ['Da Nang', 'Ho Chi Minh City'].forEach(function (city) {
      var alts = all.filter(function (r) { return !r.featured && r.city === city; });
      if (!alts.length) return;
      body.appendChild(el('h3', { text: 'More upscale options in ' + city }));
      var g = el('div', { cls: 'grid card-stack' });
      alts.forEach(function (r) { g.appendChild(diningCard(r, false)); });
      body.appendChild(g);
    });

    /* Print with every dinner's details expanded. */
    window.addEventListener('beforeprint', function () {
      for (var i = 0; i < detailToggles.length; i++) setDetails(detailToggles[i].toggle, detailToggles[i].region, true);
    });
  })();

  /* ================= NIGHTLIFE ================= */
  (function nightlife() {
    var body = document.getElementById('nightlifeBody');
    var all = list(D.nightlife);
    if (!body) return;
    if (!all.length) { body.appendChild(emptyState('Nightlife details are being updated.')); return; }
    var genres = list(D.nightlifeGenres);
    var labelOf = {};
    genres.forEach(function (g) { labelOf[g.key] = g.label; });

    body.appendChild(el('p', { cls: 'notice', text: 'Information as of 2 November 2026 from each venue\'s own site where linked, otherwise from dated guides. Lineups, cover charges and table minimums for November 2027 are set by each venue and will be confirmed when you reserve; figures are shown only where a source publishes them.' }));
    body.appendChild(linkNotice());

    var picked = [], city = 'all';
    var cityG = chipGroup('City', [{ value: 'all', label: 'Both cities' }, { value: 'Da Nang', label: 'Da Nang' }, { value: 'Ho Chi Minh City', label: 'Ho Chi Minh City' }],
      function () { return city; }, function (v) { city = v; render(); });
    var fs = el('fieldset', { cls: 'filter-group' }, [el('legend', { text: 'Music preference' })]);
    var row = el('div', { cls: 'chip-row' });
    var chips = genres.map(function (g) {
      var c = toggleChip(g.label, function () { return picked.indexOf(g.key) !== -1; }, function (on) {
        var i = picked.indexOf(g.key);
        if (on && i === -1) picked.push(g.key); else if (!on && i !== -1) picked.splice(i, 1);
        render();
      });
      row.appendChild(c); return c;
    });
    fs.appendChild(row);
    var bar = el('div', { cls: 'filter-bar', attrs: { role: 'group', 'aria-label': 'Nightlife filters' } }, [cityG, fs]);
    var reset = el('button', { cls: 'btn btn-outline', text: 'Clear filters', attrs: { type: 'button' } });
    reset.addEventListener('click', function () { picked = []; city = 'all'; chips.forEach(function (c) { c.sync(); }); cityG.sync(); render(); });
    bar.appendChild(reset);
    body.appendChild(bar);
    var count = liveCount('nightCount');
    body.appendChild(count);
    var grid = el('div', { cls: 'grid' });
    body.appendChild(grid);

    function card(v) {
      var c = cardShell(v);
      var b = el('div', { cls: 'card-body' });
      var badges = el('div', { cls: 'badge-row' }, [VO2.statusBadge(v.status || 'estimated')]);
      b.appendChild(badges);
      b.appendChild(el('p', { cls: 'card-city', text: v.city + (v.venueType ? ' · ' + v.venueType : '') }));
      b.appendChild(el('h3', { text: v.name }));
      var dl = el('dl', { cls: 'facts' });
      addRow(dl, 'Location', v.location);
      var gl = list(v.genres).map(function (k) { return labelOf[k] || k; });
      var gnode = null;
      if (gl.length || v.genresText) {
        gnode = el('span', {}, [document.createTextNode((gl.length ? gl.join(', ') : '') + (gl.length && v.genresText ? '. ' : '') + (v.genresText || ''))]);
        if (v.genreMatch === 'approximate') gnode.appendChild(el('span', { cls: 'fine-print', text: ' Filter tag is a best fit only.' }));
      }
      addRow(dl, 'Music genres', gnode);
      addRow(dl, 'Weekly themed nights', factText(v.themedNights), v.themedNights ? v.themedNights.status : null);
      addRow(dl, 'Hours', factText(v.hours), v.hours ? v.hours.status : null);
      addRow(dl, 'Dress code', factText(v.dressCode), v.dressCode ? v.dressCode.status : null);
      addRow(dl, 'Entry fee', factText(v.entryFee), v.entryFee ? v.entryFee.status : null);
      var vipText = [v.vip, factText(v.tableInfo)].filter(Boolean).join(' ');
      addRow(dl, 'VIP / tables', vipText || null, v.tableInfo ? v.tableInfo.status : null);
      if (v.ageLimit) addRow(dl, 'Age', v.ageLimit);
      addRow(dl, 'Website', v.website ? extLink('Visit page', v.website) : null);
      addRow(dl, 'Instagram', igLink(v.instagram));
      addRow(dl, 'Map', mapLinkNode(v.id, v.mapQuery));
      b.appendChild(dl);
      b.appendChild(bookBlock(v));
      if (v.note) b.appendChild(el('p', { cls: 'fine-print', text: v.note }));
      if (v.sourceUrl) b.appendChild(el('p', { cls: 'fine-print' }, [document.createTextNode('Source: '), extLink('listing', v.sourceUrl)]));
      c.appendChild(b);
      return c;
    }

    function render() {
      clear(grid);
      var shown = all.filter(function (v) {
        if (city !== 'all' && v.city !== city) return false;
        if (picked.length && !list(v.genres).some(function (g) { return picked.indexOf(g) !== -1; })) return false;
        return true;
      });
      shown.forEach(function (v) { grid.appendChild(card(v)); });
      if (!shown.length) {
        grid.appendChild(emptyState(picked.length
          ? 'No venue with a source-backed match for this music preference yet. Nothing was confirmed for these styles, so none are listed. Try another style or clear the filters.'
          : 'No venues to show.'));
      }
      count.textContent = 'Showing ' + shown.length + ' of ' + all.length + ' venues';
    }
    render();
    scrollerize(grid, '.dir-card');
  })();

  /* ================= CAFES ================= */
  (function cafes() {
    var body = document.getElementById('cafesBody');
    var all = list(D.cafes);
    if (!body) return;
    if (!all.length) { body.appendChild(emptyState('Café details are being updated.')); return; }
    var routes = list(D.cafeRoutes);
    var cities = ['Da Nang', 'Ho Chi Minh City'];
    body.appendChild(el('p', { cls: 'notice', text: 'Information as of 2 November 2026. Opening hours are shown where a source lists them; check the Map link for current hours. Many photos illustrate the drink or area, not the named café; captions say so.' }));
    var tabs = buildTabs('cafes', cities.map(function (c) { return { label: c }; }));
    body.appendChild(tabs.root);

    cities.forEach(function (city, i) {
      var panel = tabs.panels[i];
      var route = routes.filter(function (r) { return r.city === city; })[0];
      if (route) {
        var rb = el('div', { cls: 'route-box' }, [el('h3', { text: route.title })]);
        var ol = el('ol', { cls: 'route-list' });
        list(route.steps).forEach(function (id) {
          var rec = all.filter(function (c) { return c.id === id; })[0];
          if (rec) ol.appendChild(el('li', { text: rec.name }));
        });
        rb.appendChild(ol);
        if (route.note) rb.appendChild(el('p', { cls: 'fine-print', text: route.note }));
        panel.appendChild(rb);
      }
      var g = el('div', { cls: 'grid' });
      all.filter(function (c) { return c.city === city; }).forEach(function (c) {
        var card = cardShell(c);
        var b = el('div', { cls: 'card-body' });
        b.appendChild(el('div', { cls: 'badge-row' }, [VO2.statusBadge(c.status || 'estimated')]));
        b.appendChild(el('p', { cls: 'card-city', text: c.neighborhood || c.city }));
        b.appendChild(el('h3', { text: c.name }));
        if (c.atmosphere) b.appendChild(el('p', { text: c.atmosphere }));
        var dl = el('dl', { cls: 'facts' });
        addRow(dl, 'Known for', list(c.signature).length ? list(c.signature).join(', ') : null);
        addRow(dl, 'Hours', factText(c.hours));
        addRow(dl, 'Map', mapLinkNode(c.id, c.mapQuery));
        b.appendChild(dl);
        if (c.note) b.appendChild(el('p', { cls: 'fine-print', text: c.note }));
        if (c.sourceUrl) b.appendChild(el('p', { cls: 'fine-print' }, [document.createTextNode('Source: '), extLink('listing', c.sourceUrl)]));
        card.appendChild(b);
        g.appendChild(card);
      });
      panel.appendChild(g);
      scrollerize(g, '.dir-card');
    });
  })();

  /* ================= SHOPPING ================= */
  (function shopping() {
    var body = document.getElementById('shoppingBody');
    var all = list(D.shopping);
    if (!body) return;
    if (!all.length) { body.appendChild(emptyState('Shopping details are being updated.')); return; }
    var cities = ['Ho Chi Minh City', 'Da Nang'];
    body.appendChild(el('p', { cls: 'notice', text: 'Information as of 2 November 2026. Prices are set by each shop and are shown only where a source publishes them. Payment tips are general guidance.' }));
    var tabs = buildTabs('shop', cities.map(function (c) { return { label: c }; }));
    body.appendChild(tabs.root);
    cities.forEach(function (city, i) {
      var g = el('div', { cls: 'grid' });
      all.filter(function (s) { return s.city === city; }).forEach(function (s) {
        var card = cardShell(s);
        var b = el('div', { cls: 'card-body' });
        b.appendChild(el('div', { cls: 'badge-row' }, [VO2.statusBadge(s.status || 'estimated')]));
        b.appendChild(el('p', { cls: 'card-city', text: s.neighborhood || s.city }));
        b.appendChild(el('h3', { text: s.name }));
        if (list(s.categories).length) {
          var tags = el('ul', { cls: 'tag-list', attrs: { 'aria-label': 'Categories' } });
          s.categories.forEach(function (t) { tags.appendChild(el('li', { cls: 'tag', text: t })); });
          b.appendChild(tags);
        }
        if (s.description) b.appendChild(el('p', { text: s.description }));
        var dl = el('dl', { cls: 'facts' });
        addRow(dl, 'Hours', factText(s.hours), s.hours ? s.hours.status : null);
        addRow(dl, 'Prices', factText(s.priceRange));
        addRow(dl, 'Payment (general guidance)', s.payment);
        addRow(dl, 'Map', mapLinkNode(s.id, s.mapQuery));
        b.appendChild(dl);
        if (s.sourceUrl) b.appendChild(el('p', { cls: 'fine-print' }, [document.createTextNode('Source: '), extLink('listing', s.sourceUrl)]));
        card.appendChild(b);
        g.appendChild(card);
      });
      tabs.panels[i].appendChild(g);
      scrollerize(g, '.dir-card');
    });
    var tipsBox = el('div', { cls: 'route-box' }, [el('h3', { text: 'Shopping and payment tips (general guidance)' })]);
    var ul = el('ul', { cls: 'plain-list' });
    list(D.shoppingTips).forEach(function (t) { ul.appendChild(el('li', { text: t })); });
    tipsBox.appendChild(ul);
    body.appendChild(tipsBox);
  })();

  /* ================= WELLNESS ================= */
  (function wellness() {
    var body = document.getElementById('wellnessBody');
    var all = list(D.medical);
    if (!body) return;
    var dis = D.medicalDisclaimer || {};
    var box = el('div', { cls: 'disclaimer', attrs: { role: 'note', 'aria-label': 'Medical disclaimer' } }, [
      el('h3', { text: 'Not medical advice' })
    ]);
    ['general', 'metformin', 'bodyContouring', 'separation'].forEach(function (k) {
      if (dis[k]) box.appendChild(el('p', { cls: k === 'metformin' ? 'metformin-note' : '', text: dis[k] }));
    });
    box.appendChild(el('p', { text: 'November 26 is a consultation day only: results are not guaranteed, and eligibility, recovery and scheduling require medical confirmation.' }));
    body.appendChild(box);
    body.appendChild(linkNotice());
    if (!all.length) { body.appendChild(emptyState('Provider details are being updated.')); return; }

    function providerCard(p) {
      var card = cardShell(p);
      var b = el('div', { cls: 'card-body' });
      b.appendChild(el('div', { cls: 'badge-row' }, [VO2.statusBadge(p.status || 'estimated')]));
      b.appendChild(el('p', { cls: 'card-city', text: p.city + ' · ' + (p.category || '').replace(/-/g, ' ') }));
      b.appendChild(el('h3', { text: p.name }));
      var dl = el('dl', { cls: 'facts' });
      addRow(dl, 'Location', p.location);
      addRow(dl, 'Credentials', factText(p.credentials), p.credentials ? p.credentials.status : null);
      addRow(dl, 'Services', list(p.services).length ? list(p.services).join('; ') : null);
      if (p.serviceNotes) addRow(dl, 'Service notes', p.serviceNotes);
      addRow(dl, 'Price', factText(p.price));
      addRow(dl, 'Duration', p.duration);
      addRow(dl, 'Consultation', p.consultation);
      addRow(dl, 'Recovery', p.recovery);
      addRow(dl, 'Map', mapLinkNode(p.id, p.mapQuery));
      b.appendChild(dl);
      if (p.note) b.appendChild(el('p', { cls: 'fine-print', text: p.note }));
      var links = el('div', { cls: 'link-row' });
      if (p.officialUrl) links.appendChild(extLink('Official website', p.officialUrl, 'btn btn-outline btn-sm'));
      if (p.programUrl) links.appendChild(extLink('Programme details', p.programUrl, 'btn btn-outline btn-sm'));
      b.appendChild(links);
      b.appendChild(bookBlock(p));
      if (p.sourceUrl) b.appendChild(el('p', { cls: 'fine-print' }, [document.createTextNode('Source: '), extLink('listing', p.sourceUrl)]));
      card.appendChild(b);
      return card;
    }

    var groups = [
      { title: 'Medical and physician-led care', intro: 'Physical exam (Nov 25), dental cleaning (Nov 25) and physician consultation for noninvasive body contouring (Nov 26). Only a licensed clinician can advise on suitability.',
        test: function (p) { return p.category !== 'spa'; } },
      { title: 'Cosmetic spa services', intro: 'Massage and facials are relaxation and cosmetic services, not medical treatment.',
        test: function (p) { return p.category === 'spa'; } }
    ];
    groups.forEach(function (gr) {
      var items = all.filter(gr.test);
      if (!items.length) return;
      body.appendChild(el('h3', { text: gr.title }));
      body.appendChild(el('p', { cls: 'lead', text: gr.intro }));
      var g = el('div', { cls: 'grid' });
      items.forEach(function (p) { g.appendChild(providerCard(p)); });
      body.appendChild(g);
      scrollerize(g, '.dir-card');
    });
  })();

  /* ================= FLIGHTS HELPER ================= */
  (function flights() {
    var host = document.querySelector('#flights .container');
    if (!host) return;
    var base = 'https://www.google.com/travel/flights?q=';
    var legs = list(D.flightSearches);
    if (!legs.length) return;
    var box = el('div', { cls: 'route-box flights-box', attrs: { role: 'group', 'aria-labelledby': 'flightsHelperTitle' } }, [
      el('h3', { text: 'Flight search helper', attrs: { id: 'flightsHelperTitle' } }),
      el('p', { cls: 'fine-print', text: 'These are Google Flights search links, not bookings. Schedules, fares and availability for November 2027 must be checked on Google Flights and with the airline. Flights are not booked.' })
    ]);
    var row = el('div', { cls: 'link-row' });
    legs.forEach(function (l) {
      var q = 'Flights from ' + l.from + ' to ' + l.to + ' on ' + l.date + ' oneway';
      row.appendChild(el('a', { cls: 'btn btn-outline btn-sm', attrs: { href: base + encodeURIComponent(q), target: '_blank', rel: 'noopener noreferrer' } }, [
        document.createTextNode(l.label),
        el('span', { cls: 'sr-only', text: ' (Google Flights search, opens in a new tab)' })
      ]));
    });
    box.appendChild(row);
    host.appendChild(box);
  })();

  /* ================= TRAINS (Part 3, OD4) ================= */
  /* Train comparisons are ONLY against the domestic flight a train could replace; a
     train never replaces the transpacific leg. Both class rows (sleeper + seated
     premium) are rendered where they exist. No price is invented: a missing fact shows
     "not verified" with a link to check. All strings via textContent. */
  function trainBadges(t) {
    var row = el('div', { cls: 'badge-row' });
    row.appendChild(VO2.statusBadge(t.status || 'estimated'));
    if (t.longRailFlag) row.appendChild(el('span', { cls: 'badge badge-warn train-warn', text: '~16h rail time' }));
    if (t.offRoute) row.appendChild(el('span', { cls: 'badge badge-note train-offroute', text: 'Off-itinerary \u2013 optional add-on' }));
    if (t.scenic) row.appendChild(el('span', { cls: 'badge badge-note train-scenic', text: 'Scenic route' }));
    return row;
  }

  /* A class row: label + price (a number only when a confirmed fare exists, else
     "not verified" with a check link) + any note. */
  function trainClassNode(c) {
    var wrap = el('div', { cls: 'train-class' });
    wrap.appendChild(el('p', { cls: 'train-class-label' }, [
      el('strong', { text: (c.kind === 'sleeper' ? 'Sleeper berth: ' : 'Seated (premium): ') }),
      document.createTextNode(c.label || '')
    ]));
    var priceLine = el('p', { cls: 'train-class-price' });
    if (typeof c.priceUsd === 'number' && c.priceStatus !== 'not_verified') {
      priceLine.appendChild(el('strong', { text: 'Fare: ' }));
      priceLine.appendChild(document.createTextNode(VO2.fmtUSD(c.priceUsd) + ' '));
      priceLine.appendChild(VO2.statusBadge(c.priceStatus || 'estimated'));
    } else {
      priceLine.appendChild(el('strong', { text: 'Fare: ' }));
      priceLine.appendChild(document.createTextNode('not verified '));
      if (c.checkLink) priceLine.appendChild(extLink(c.checkLinkLabel || 'Check fares', c.checkLink));
    }
    wrap.appendChild(priceLine);
    if (c.priceNote) wrap.appendChild(el('p', { cls: 'fine-print', text: c.priceNote }));
    return wrap;
  }

  function trainCard(t) {
    var card = el('article', { cls: 'card train-card' + (t.offRoute ? ' train-card-offroute' : ''), attrs: { 'data-id': t.id } });
    var b = el('div', { cls: 'card-body' });
    b.appendChild(trainBadges(t));
    b.appendChild(el('p', { cls: 'card-city', text: (t.fromName || t.from) + ' \u2192 ' + (t.toName || t.to) }));
    b.appendChild(el('h3', { text: t.operator || 'Train' }));
    var dl = el('dl', { cls: 'facts' });
    addRow(dl, 'Journey time', t.durationText, t.durationStatus);
    addRow(dl, 'Distance', t.distanceText);
    if (t.scenicStretch) addRow(dl, 'Scenic stretch', t.scenicStretch, 'reported');
    addRow(dl, 'Comfort', t.comfort);
    b.appendChild(dl);
    // Both class rows (sleeper + seated premium) where they exist.
    list(t.classes).forEach(function (c) { b.appendChild(trainClassNode(c)); });
    if (t.note) b.appendChild(el('p', { cls: 'fine-print', text: t.note }));
    var srcRow = el('p', { cls: 'fine-print' });
    if (t.sourceUrl) {
      srcRow.appendChild(document.createTextNode('Source (checked ' + (t.checkedDate || '') + '): '));
      srcRow.appendChild(extLink('rail guide', t.sourceUrl));
    }
    if (t.scenicSourceUrl) {
      srcRow.appendChild(document.createTextNode(' \u00b7 Scenic stretch: '));
      srcRow.appendChild(extLink('source', t.scenicSourceUrl));
    }
    if (srcRow.childNodes.length) b.appendChild(srcRow);
    card.appendChild(b);
    return card;
  }

  /* Look up the Flight Monitor domestic row for a given FROM-TO (e.g. DAD-SGN), or
     the flightSearches helper link, so the fly side of the comparison pulls from real
     on-page data where it exists and shows "not verified" otherwise. */
  function flightSearchFor(fromTo) {
    var legs = list(D.flightSearches);
    for (var i = 0; i < legs.length; i++) {
      if (legs[i].from + '-' + legs[i].to === fromTo) return legs[i];
    }
    return null;
  }

  /* Trains section renderer (Task 5.3) + per-segment comparison (Task 5.4). */
  function renderTrains(body) {
    var meta = D.trainsMeta || {};
    var all = list(D.trains);
    if (!all.length) { body.appendChild(emptyState('Train details are being updated.')); return; }

    body.appendChild(el('p', { cls: 'lead', text: 'Trains are compared only against the domestic flight a train could replace. A train never replaces the long transpacific flight. Both a sleeper and a seated (premium) option are shown where they exist.' }));
    if (meta.note) {
      var notice = el('p', { cls: 'notice', text: meta.note + ' ' });
      if (meta.noteSourceUrl) notice.appendChild(extLink('Vietnam Railways', meta.noteSourceUrl));
      body.appendChild(notice);
    }

    // Cards.
    var grid = el('div', { cls: 'grid train-grid' });
    all.forEach(function (t) { grid.appendChild(trainCard(t)); });
    body.appendChild(grid);

    // Per-segment comparison table: EXCLUDE off-route Sapa add-on (replaces no flight).
    var replaceable = all.filter(function (t) { return !t.offRoute && t.replacesFlight; });
    if (replaceable.length) {
      body.appendChild(el('h3', { text: 'Fly vs train, per segment' }));
      body.appendChild(el('p', { cls: 'lead', text: 'Only domestic segments a train could replace are shown. The off-itinerary Sapa add-on is excluded because it replaces no flight.' }));
      var scroll = el('div', { cls: 'table-scroll', attrs: { tabindex: '0', role: 'region', 'aria-label': 'Fly versus train comparison table, scrolls sideways on small screens' } });
      var table = el('table', { cls: 'compare-table train-compare' });
      table.appendChild(el('caption', { cls: 'sr-only', text: 'Per-segment comparison of taking the train versus the domestic flight it could replace' }));
      var thead = el('thead'), hr = el('tr');
      ['Segment', 'Option', 'Cost', 'Door-to-door time', 'Comfort'].forEach(function (h) {
        hr.appendChild(el('th', { text: h, attrs: { scope: 'col' } }));
      });
      thead.appendChild(hr); table.appendChild(thead);
      var tb = el('tbody');

      function td(value) {
        var cell = el('td');
        if (value === null || value === undefined || value === '') cell.appendChild(dashEl());
        else if (typeof value === 'string') cell.textContent = value;
        else cell.appendChild(value);
        return cell;
      }
      function notVerifiedNode(checkLink, label) {
        var span = el('span', {}, [document.createTextNode('not verified ')]);
        if (checkLink) span.appendChild(extLink(label || 'check', checkLink));
        return span;
      }

      replaceable.forEach(function (t) {
        var segLabel = (t.from || '') + ' \u2192 ' + (t.to || '');
        // Train row.
        var trTrain = el('tr', { cls: 'train-compare-train' });
        trTrain.appendChild(el('th', { attrs: { scope: 'row' } }, [
          el('span', { text: segLabel }),
          t.longRailFlag ? el('span', { cls: 'fine-print', text: '~16h rail time' }) : null
        ]));
        trTrain.appendChild(td('Train (' + (t.operator || 'rail') + ')'));
        // Train cost: cheapest class with a confirmed number, else "not verified" + link.
        var priced = list(t.classes).filter(function (c) { return typeof c.priceUsd === 'number' && c.priceStatus !== 'not_verified'; });
        var costNode;
        if (priced.length) {
          var lowest = priced.reduce(function (a, c) { return c.priceUsd < a.priceUsd ? c : a; });
          costNode = el('span', {}, [document.createTextNode('from ' + VO2.fmtUSD(lowest.priceUsd) + ' '), VO2.statusBadge(lowest.priceStatus || 'estimated')]);
        } else {
          var firstClass = list(t.classes)[0] || {};
          costNode = notVerifiedNode(firstClass.checkLink, firstClass.checkLinkLabel || 'check fares');
        }
        trTrain.appendChild(td(costNode));
        trTrain.appendChild(td(t.durationText || notVerifiedNode(t.durationSourceUrl, 'check')));
        trTrain.appendChild(td(t.comfort || null));
        tb.appendChild(trTrain);

        // Flight row (the flight the train could replace).
        var trFly = el('tr', { cls: 'train-compare-fly' });
        trFly.appendChild(el('th', { attrs: { scope: 'row' } }, [el('span', { cls: 'fine-print', text: 'Flight it replaces' })]));
        trFly.appendChild(td('Domestic flight (' + t.replacesFlight.replace('-', ' \u2192 ') + ')'));
        var fs = flightSearchFor(t.replacesFlight);
        // Fare is not verified (monitor shows domestic fares only when live+ok; no live data here).
        var flyCost = el('span', {}, [document.createTextNode('not verified ')]);
        if (fs) flyCost.appendChild(extLink('search Google Flights', 'https://www.google.com/travel/flights?q=' + encodeURIComponent('Flights from ' + fs.from + ' to ' + fs.to + ' on ' + fs.date + ' oneway')));
        trFly.appendChild(td(flyCost));
        trFly.appendChild(td('About 1\u20131.5 hours in the air, plus airport time.'));
        trFly.appendChild(td('Fastest option; less scenic than the train.'));
        tb.appendChild(trFly);
      });
      table.appendChild(tb); scroll.appendChild(table); body.appendChild(scroll);
    }

    // Trip-level "Fly vs Train-for-these-segments" summary for A and B.
    body.appendChild(el('h3', { text: 'Trip-level: fly vs train for these segments' }));
    var legsMeta = meta.replaceableLegs || {};
    [
      { key: 'A', label: 'Itinerary A (arrives Hanoi)' },
      { key: 'B', label: 'Itinerary B / Option 2 (arrives Da Nang)' }
    ].forEach(function (itin) {
      var legs = list(legsMeta[itin.key]);
      if (!legs.length) return;
      var box = el('div', { cls: 'route-box train-trip' });
      box.appendChild(el('h4', { text: itin.label }));
      var ul = el('ul', { cls: 'plain-list' });
      legs.forEach(function (leg) {
        var text;
        if (leg.offRoute) {
          text = leg.from + ' \u2192 ' + leg.to + ': off-itinerary optional add-on (replaces no flight).';
        } else {
          text = leg.from + ' \u2192 ' + leg.to + ': train could replace the domestic ' + (leg.replacesFlight ? leg.replacesFlight.replace('-', ' \u2192 ') : 'flight') + '.'
            + (leg.scenic ? ' Scenic by rail.' : '')
            + (leg.longRailFlag ? ' Long rail time (~16h) \u2014 the flight is far faster.' : '');
        }
        ul.appendChild(el('li', { text: text }));
      });
      box.appendChild(ul);
      box.appendChild(el('p', { cls: 'fine-print', text: 'Takeaway: fly the domestic hop to save a day; take the train only for the scenery. Every fare above is not verified until you check it for your dates. The transpacific flight is never a train option.' }));
      body.appendChild(box);
    });
  }

  (function trains() {
    var body = document.getElementById('trainsBody');
    if (!body) return;
    renderTrains(body);
  })();

  /* ================= TRAVEL OPTIONS (Task 7.1, Option 2 half) ================= */
  /* A compact summary near the top of Option 2 that pulls together: the recommended
     provisional departure date + mixed-cabin per-person headline (or "not verified")
     + the train takeaway. The full Part 1 timing view and the Flight Monitor table live
     in the #flights section (rendered by flight-monitor.js); the Part 3 train comparison
     lives in #trains. This section links to both and never invents a number. */
  (function travelOptions() {
    var body = document.getElementById('travelOptionsBody');
    if (!body) return;

    // Recommended provisional departure. FEAT-001 set outbound_date=2027-11-19 provisional
    // (landing 2027-11-21 fixed). Prefer the live snapshot value if present, else provisional.
    var recDate = '2027-11-19';
    var snap = window.FLIGHT_MONITOR_DATA;
    if (snap && snap.itineraries && snap.itineraries.option2 && snap.itineraries.option2.outbound_date) {
      recDate = snap.itineraries.option2.outbound_date;
    }
    body.appendChild(el('p', { cls: 'lead travel-options-summary' }, [
      document.createTextNode('Recommended provisional departure: '),
      el('strong', { text: VO2.formatDate(recDate) + ', 2027' }),
      document.createTextNode(' (landing in Vietnam on Nov 21, 2027 is fixed; the departure stays provisional until Part 1 schedule data exists). '),
      document.createTextNode('Mixed cabin (business long-haul + economy elsewhere): '),
      el('strong', { cls: 'travel-options-mixed', text: 'not verified' }),
      document.createTextNode(' \u2014 a per-person headline shows only when live fares return for both searches; it is never a single-ticket quote. '),
      document.createTextNode('Train takeaway: fly the short domestic hop to save a day; take the train only for the scenery \u2014 a train never replaces the transpacific flight.')
    ]));
    var links = el('p', { cls: 'travel-options-links' }, [
      document.createTextNode('See the full detail below: '),
      el('a', { cls: 'act-link', text: 'Flight Monitor and departure timing', attrs: { href: '#flights' } }),
      document.createTextNode(' \u00b7 '),
      el('a', { cls: 'act-link', text: 'Train comparison', attrs: { href: '#trains' } })
    ]);
    body.appendChild(links);
    body.appendChild(el('p', { cls: 'fine-print', text: 'Nothing here is booked. All fares and times are not verified until checked for your November 2027 dates.' }));
  })();

  /* ================= COPY AS TEXT (Task 7.3) ================= */
  /* Builds a plain-text summary from values ALREADY on the page (recommended date,
     mixed-cabin headline or "not verified", train-vs-fly lines) and copies it with
     navigator.clipboard, falling back to a hidden textarea + execCommand('copy'). */
  (function copyAsText() {
    var btn = document.getElementById('copyTextBtn');
    if (!btn) return;

    function textOf(sel) {
      var n = document.querySelector(sel);
      return n ? n.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function buildSummary() {
      var lines = ['Vietnam Option 2 \u2013 Travel Options summary'];
      var summary = textOf('#travelOptionsBody .travel-options-summary');
      if (summary) lines.push(summary);
      // Train trip-level takeaways already rendered on the page.
      var trips = document.querySelectorAll('#trainsBody .train-trip');
      for (var i = 0; i < trips.length; i++) {
        var h = trips[i].querySelector('h4');
        if (h) lines.push('');
        if (h) lines.push(h.textContent.trim());
        var items = trips[i].querySelectorAll('li');
        for (var j = 0; j < items.length; j++) lines.push('- ' + items[j].textContent.replace(/\s+/g, ' ').trim());
      }
      lines.push('');
      lines.push('All fares and times are not verified until checked for your November 2027 dates. Nothing is booked.');
      return lines.join('\n');
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    function flash(msg) {
      var label = btn.querySelector('.tool-label');
      var prev = label ? label.textContent : null;
      if (label) label.textContent = msg;
      btn.setAttribute('aria-live', 'polite');
      setTimeout(function () { if (label && prev !== null) label.textContent = prev; }, 2000);
    }

    btn.addEventListener('click', function () {
      var text = buildSummary();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flash('Copied'); }, function () {
          flash(fallbackCopy(text) ? 'Copied' : 'Copy failed');
        });
      } else {
        flash(fallbackCopy(text) ? 'Copied' : 'Copy failed');
      }
    });
  })();
})();
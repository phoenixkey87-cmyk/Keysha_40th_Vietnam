/* Flight Monitor renderer. Vanilla JS, shared by both itineraries.
 * Mount: <div data-flight-monitor data-itinerary="option2" data-origin="STL" data-arrive="DAD" data-depart="SGN"></div>
 * Data: window.FLIGHT_MONITOR_DATA (script tag, works from file://) then fetch('flight-monitor/data/latest.json').
 * Rules: prices are shown ONLY for status "ok" rows in a "live" snapshot. Everything else is "not verified".
 * All text goes through textContent. */
(function () {
  'use strict';

  var CABIN_LABEL = {
    economy: 'Economy', business: 'Business', first: 'First',
    mixed_cabin: 'Business long-haul + Economy'
  };
  var CABIN_LABEL_SHORT = { mixed_cabin: 'Mixed cabin' };
  var JSON_URL = 'flight-monitor/data/latest.json';
  var LANDING_DATE = '2027-11-21';
  var TIMING_UNVERIFIED = 'not verified \u2013 November 2027 schedules are not published yet';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function usd(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function fmtDuration(min) {
    if (typeof min !== 'number' || !isFinite(min)) return 'not verified';
    return Math.floor(min / 60) + 'h ' + (min % 60) + 'm';
  }

  function fmtStops(n) {
    if (typeof n !== 'number') return 'not verified';
    return n === 0 ? 'Nonstop' : n + (n === 1 ? ' stop' : ' stops');
  }

  function fmtTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    try {
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return d.toISOString();
    }
  }

  function fmtDate(iso) {
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(p[1], 10) - 1] + ' ' + parseInt(p[2], 10);
  }

  function isHttps(u) {
    return typeof u === 'string' && /^https:\/\//i.test(u);
  }

  function globalPath(path) {
    var cur = window;
    var parts = String(path).split('.');
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function validSnapshot(s) {
    return !!(s && typeof s === 'object' && s.schema_version === 1 && s.itineraries && typeof s.itineraries === 'object');
  }

  /* True when at least one row in THIS itinerary carries a real, verified fare.
   * Drives the banner split between "fares are live" and "checked but nothing
   * published yet". Never reads a price off a non-"ok" row. */
  function hasOkRow(rows) {
    if (!Array.isArray(rows)) return false;
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i].status === 'ok' && typeof rows[i].price_usd === 'number') return true;
    }
    return false;
  }

  /* Error type for the failed-check banner, using only backend-sanitised fields.
   * Never surfaces key, URL, or raw message details. */
  function errorType(snap) {
    var e = snap && snap.last_error;
    if (e && typeof e === 'object' && typeof e.type === 'string' && e.type) return e.type;
    if (typeof e === 'string' && e) return e;
    return 'unknown error';
  }

  /* Rows used when no usable snapshot exists: always "not verified". */
  function fallbackRows(mount) {
    var origin = mount.getAttribute('data-origin') || 'STL';
    var arrive = mount.getAttribute('data-arrive') || '';
    var depart = mount.getAttribute('data-depart') || '';
    var route = arrive === depart ? origin + ' \u21c4 ' + arrive : origin + ' \u2192 ' + arrive + ' / ' + depart + ' \u2192 ' + origin;
    var rows = ['economy', 'business', 'first'].map(function (c) {
      return { id: 'fallback-' + c, route: route, origin: origin, kind: 'primary', cabin: c, status: 'not_verified', reason: 'no flight data loaded', checked_at: null };
    });
    // Keep the mixed-cabin row present offline so the table shape stays stable.
    rows.push({
      id: 'fallback-mixed_cabin', route: origin + ' \u21c4 mixed cabin', origin: origin,
      kind: 'mixed_cabin', cabin: 'mixed_cabin', status: 'not_verified',
      mixed_label: 'Business long-haul + Economy elsewhere, not a single-ticket quote',
      components: { longhaul: 'business', other: 'economy' },
      all_economy_total: null, all_business_total: null, upgrade_delta_usd: null,
      travelers: null, group_total: null, longhaul_leg: null,
      reason: 'no flight data loaded', checked_at: null
    });
    return rows;
  }

  function badge(text, cls) {
    return el('li', 'fm-badge ' + cls, text);
  }

  /* The mixed-cabin row: two real searches combined per person, never a blended
   * single-ticket price. When live+ok we show the exact labelled sub-line plus a
   * per-person breakdown and a group-total line; otherwise "not verified". */
  function renderMixedBody(tr, row, ctx, ok) {
    var live = ctx.live;

    // Detail column (spans the airline/stops/duration columns).
    var tdDetail = el('td');
    tdDetail.colSpan = 3;
    tdDetail.setAttribute('data-label', 'Mixed-cabin breakdown');
    if (ok) {
      tdDetail.appendChild(el('span', null, row.mixed_label ||
        'Business long-haul + Economy elsewhere, not a single-ticket quote.'));
      var leg = row.longhaul_leg;
      var legText = (leg && leg.from && leg.to) ? ('Long-haul leg: ' + leg.from + ' \u2192 ' + leg.to) : 'Long-haul leg: not identified';
      tdDetail.appendChild(el('span', 'fm-sub', legText));
      var ul = el('ul', 'fm-breakdown');
      if (typeof row.all_economy_total === 'number') ul.appendChild(el('li', null, 'All-economy fare: ' + usd(row.all_economy_total) + ' per person'));
      if (typeof row.all_business_total === 'number') ul.appendChild(el('li', null, 'All-business fare: ' + usd(row.all_business_total) + ' per person'));
      if (typeof row.upgrade_delta_usd === 'number') ul.appendChild(el('li', null, 'Upgrade delta: ' + usd(row.upgrade_delta_usd) + ' per person'));
      if (ul.childNodes.length) tdDetail.appendChild(ul);
    } else {
      var notOffered = live && row.status === 'not_offered';
      tdDetail.className = 'fm-muted';
      tdDetail.appendChild(el('span', null, notOffered ? 'Not offered' : 'not verified'));
      tdDetail.appendChild(el('span', 'fm-sub',
        row.mixed_label || 'Business long-haul + Economy elsewhere, not a single-ticket quote.'));
      if (!notOffered && row.reason && live) tdDetail.appendChild(el('span', 'fm-sub', row.reason));
    }
    tr.appendChild(tdDetail);

    // Price column: per-person approximation + group total line.
    var tdPrice = el('td', 'fm-price');
    tdPrice.setAttribute('data-label', 'Price/person');
    if (ok) {
      tdPrice.appendChild(el('span', null, usd(row.price_usd)));
      tdPrice.appendChild(el('span', 'fm-sub', 'per person (approximate)'));
      var travelers = row.travelers;
      var groupLine;
      if (typeof row.group_total === 'number' && typeof travelers === 'number' && travelers >= 1) {
        groupLine = 'Group of ' + travelers + ': ' + usd(row.group_total);
      } else {
        groupLine = 'Group total: not verified';
      }
      tdPrice.appendChild(el('span', 'fm-sub', groupLine));
    } else {
      tdPrice.appendChild(el('span', 'fm-muted', live && row.status === 'not_offered' ? 'Not offered' : 'not verified'));
    }
    tr.appendChild(tdPrice);

    // Change
    var tdChange = el('td');
    tdChange.setAttribute('data-label', 'Change');
    if (ok && row.change) {
      var c = row.change;
      if (c.direction === 'up') {
        var up = el('span', 'fm-up', '\u25b2 ' + usd(c.usd));
        up.setAttribute('aria-label', 'up ' + usd(c.usd));
        tdChange.appendChild(up);
      } else if (c.direction === 'down') {
        var dn = el('span', 'fm-down', '\u25bc ' + usd(c.usd));
        dn.setAttribute('aria-label', 'down ' + usd(c.usd));
        tdChange.appendChild(dn);
      } else {
        tdChange.appendChild(el('span', 'fm-muted', 'no change'));
      }
    } else {
      tdChange.appendChild(el('span', 'fm-muted', ok ? 'first check' : '\u2014'));
    }
    tr.appendChild(tdChange);

    // Checked
    var tdChecked = el('td');
    tdChecked.setAttribute('data-label', 'Checked');
    if (row.checked_at && live) {
      var t = el('time', null, fmtTime(row.checked_at));
      t.setAttribute('datetime', row.checked_at);
      tdChecked.appendChild(t);
    } else {
      tdChecked.appendChild(el('span', 'fm-muted', 'never checked'));
    }
    tr.appendChild(tdChecked);
  }

  function renderRow(row, ctx) {
    var live = ctx.live;
    var ok = live && row.status === 'ok' && typeof row.price_usd === 'number';
    var isMixed = row.kind === 'mixed_cabin';
    var tr = el('tr', 'fm-row fm-kind-' + (row.kind || 'primary'));

    // Route
    var tdRoute = el('td');
    tdRoute.setAttribute('data-label', 'Route');
    tdRoute.appendChild(el('span', 'fm-route', row.route || ''));
    if (row.kind === 'traveler' && row.traveler_name) {
      tdRoute.appendChild(el('span', 'fm-sub', row.traveler_name + '\u2019s home airport'));
    } else if (row.kind === 'alternate') {
      tdRoute.appendChild(el('span', 'fm-sub', 'Alternate origin'));
    } else if (isMixed) {
      tdRoute.appendChild(el('span', 'fm-sub', 'Two searches, not a single ticket'));
    }
    tr.appendChild(tdRoute);

    // Cabin
    var tdCabin = el('td');
    tdCabin.setAttribute('data-label', 'Cabin');
    if (isMixed) {
      var badgeCabin = el('span', 'fm-badge fm-b-mixed', CABIN_LABEL_SHORT.mixed_cabin);
      tdCabin.appendChild(badgeCabin);
      tdCabin.appendChild(el('span', 'fm-sub', CABIN_LABEL.mixed_cabin));
    } else {
      tdCabin.appendChild(document.createTextNode(CABIN_LABEL[row.cabin] || row.cabin));
    }
    tr.appendChild(tdCabin);

    if (isMixed) {
      renderMixedBody(tr, row, ctx, ok);
      return tr;
    }

    if (ok) {
      var tdAir = el('td', null, row.airline || 'not verified');
      tdAir.setAttribute('data-label', 'Airline');
      tr.appendChild(tdAir);

      var tdStops = el('td', null, fmtStops(row.stops));
      tdStops.setAttribute('data-label', 'Stops');
      if (row.layovers && row.layovers.length) tdStops.appendChild(el('span', 'fm-sub', 'via ' + row.layovers.join(', ')));
      tr.appendChild(tdStops);

      var tdDur = el('td', null, fmtDuration(row.duration_min));
      tdDur.setAttribute('data-label', 'Duration');
      tr.appendChild(tdDur);
    } else {
      var notOffered = live && row.status === 'not_offered';
      var tdNote = el('td', 'fm-muted');
      tdNote.colSpan = 3;
      tdNote.setAttribute('data-label', 'Airline / stops / duration');
      tdNote.appendChild(el('span', null, notOffered ? 'Not offered on this route' : 'not verified'));
      if (!notOffered && row.reason && live) tdNote.appendChild(el('span', 'fm-sub', row.reason));
      tr.appendChild(tdNote);
    }

    // Price
    var tdPrice = el('td', 'fm-price');
    tdPrice.setAttribute('data-label', 'Price/person');
    if (ok) {
      var priceText = usd(row.price_usd);
      if (isHttps(row.booking_url)) {
        var a = el('a', 'fm-link', priceText);
        a.href = row.booking_url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.appendChild(el('span', 'fm-sr', ' per person, view fare on Google Flights (opens in a new tab)'));
        tdPrice.appendChild(a);
      } else {
        tdPrice.appendChild(el('span', null, priceText));
      }
      tdPrice.appendChild(el('span', 'fm-sub', 'per person'));
      if (ctx.travelers > 1) tdPrice.appendChild(el('span', 'fm-sub', 'Group of ' + ctx.travelers + ': ' + usd(row.price_usd * ctx.travelers)));
      var badges = el('ul', 'fm-badges');
      var th = ctx.thresholds;
      if (row.drop_flag) badges.appendChild(badge('Drop over ' + th.drop_pct + '%', 'fm-b-drop'));
      if (row.shift && typeof row.shift.saving_usd === 'number') {
        badges.appendChild(badge('Save ' + usd(row.shift.saving_usd) + ' by shifting dates (' + fmtDate(row.shift.dates[0]) + '\u2013' + fmtDate(row.shift.dates[1]) + ')', 'fm-b-shift'));
      }
      if (row.alt_flag) badges.appendChild(badge('Cheaper origin: ' + row.origin + ' saves ' + usd(row.alt_saving_usd), 'fm-b-alt'));
      if (typeof row.low_30d === 'number') badges.appendChild(badge('30-day low ' + usd(row.low_30d), 'fm-b-low'));
      if (badges.childNodes.length) tdPrice.appendChild(badges);
    } else {
      tdPrice.appendChild(el('span', 'fm-muted', live && row.status === 'not_offered' ? 'Not offered' : 'not verified'));
    }
    tr.appendChild(tdPrice);

    // Change
    var tdChange = el('td');
    tdChange.setAttribute('data-label', 'Change');
    if (ok && row.change) {
      var c = row.change;
      if (c.direction === 'up') {
        var up = el('span', 'fm-up', '\u25b2 ' + usd(c.usd));
        up.setAttribute('aria-label', 'up ' + usd(c.usd));
        tdChange.appendChild(up);
      } else if (c.direction === 'down') {
        var dn = el('span', 'fm-down', '\u25bc ' + usd(c.usd));
        dn.setAttribute('aria-label', 'down ' + usd(c.usd));
        tdChange.appendChild(dn);
      } else {
        tdChange.appendChild(el('span', 'fm-muted', 'no change'));
      }
    } else {
      tdChange.appendChild(el('span', 'fm-muted', ok ? 'first check' : '\u2014'));
    }
    tr.appendChild(tdChange);

    // Checked
    var tdChecked = el('td');
    tdChecked.setAttribute('data-label', 'Checked');
    if (row.checked_at && live) {
      var t = el('time', null, fmtTime(row.checked_at));
      t.setAttribute('datetime', row.checked_at);
      tdChecked.appendChild(t);
    } else {
      tdChecked.appendChild(el('span', 'fm-muted', 'never checked'));
    }
    tr.appendChild(tdChecked);
    return tr;
  }

  function fmtHM(iso) {
    // Local HH:MM from an ISO-ish segment time; falls back to the raw value.
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }

  /* Does a candidate row carry real, usable timing data? Only when the snapshot
   * is live AND the backend verified an arrival date from returned segments. */
  function hasTiming(row, live) {
    return !!(live && row && row.arrival && row.arrival.verified &&
      Array.isArray(row.segments) && row.segments.length);
  }

  function timingBadges(row) {
    var badges = el('ul', 'fm-badges');
    if (row.arrival && row.arrival.slips) badges.appendChild(badge('Arrives Nov 22', 'fm-b-slip'));
    if (row.short_connection) badges.appendChild(badge('Tight connection (<2h)', 'fm-b-tight'));
    return badges.childNodes.length ? badges : null;
  }

  /* Tasks 2.1-2.2: departure-timing view per candidate date. Shows airline, each
   * segment FROM->TO depHH:MM->arrHH:MM, total duration, each layover length,
   * arrival day and flags. When no timing data is available (schedules unpublished)
   * it shows a single "not verified" row instead of inventing a schedule. */
  function renderTimingView(candidates, live) {
    var section = el('section', 'fm-timing');
    section.setAttribute('aria-labelledby', 'fmTimingHead-' + Math.random().toString(36).slice(2));
    var head = el('h3', 'fm-sub-head', 'Departure timing');
    head.id = section.getAttribute('aria-labelledby');
    section.appendChild(head);
    section.appendChild(el('p', 'fm-note', 'Each candidate St. Louis departure must land in Vietnam by ' + fmtDate(LANDING_DATE) + ', 2027.'));

    candidates.forEach(function (row) {
      var card = el('div', 'fm-timing-card');
      var depDate = row.traveler_name || (row.arrival && row.arrival.date) || '';
      card.appendChild(el('h4', 'fm-timing-date', 'Depart ' + (depDate ? fmtDate(depDate) : 'not verified')));

      if (!hasTiming(row, live)) {
        card.appendChild(el('p', 'fm-muted', TIMING_UNVERIFIED));
        section.appendChild(card);
        return;
      }

      card.appendChild(el('p', 'fm-timing-airline', row.airline || 'not verified'));
      var ol = el('ol', 'fm-segments');
      row.segments.forEach(function (seg) {
        var li = el('li');
        li.appendChild(el('span', 'fm-seg-route', (seg.from || '?') + ' \u2192 ' + (seg.to || '?')));
        li.appendChild(el('span', 'fm-seg-time', ' ' + fmtHM(seg.dep_local) + ' \u2192 ' + fmtHM(seg.arr_local)));
        if (typeof seg.duration_min === 'number') li.appendChild(el('span', 'fm-sub', fmtDuration(seg.duration_min)));
        ol.appendChild(li);
      });
      card.appendChild(ol);

      // Layover lengths between consecutive segments.
      for (var i = 1; i < row.segments.length; i++) {
        var prev = row.segments[i - 1], next = row.segments[i];
        var gap = (new Date(next.dep_local).getTime() - new Date(prev.arr_local).getTime()) / 60000;
        if (isFinite(gap) && gap >= 0) {
          card.appendChild(el('p', 'fm-sub', 'Layover at ' + (prev.to || '?') + ': ' + fmtDuration(gap)));
        }
      }

      if (typeof row.duration_min === 'number') {
        card.appendChild(el('p', 'fm-sub', 'Total trip: ' + fmtDuration(row.duration_min)));
      }
      var arrDate = (row.arrival && row.arrival.date) ? fmtDate(row.arrival.date) : 'not verified';
      card.appendChild(el('p', 'fm-sub', 'Arrives: ' + arrDate));
      var tb = timingBadges(row);
      if (tb) card.appendChild(tb);
      section.appendChild(card);
    });
    return section;
  }

  /* Tasks 2.1-2.2: a single recommendation card with one date + a short rationale.
   * Defaults to the earlier departure (Nov 19). Stays provisional and says
   * "arrival timing not verified" whenever the chosen candidate has no verified
   * arrival. Never invents a time. */
  function renderRecommendation(candidates, live) {
    var section = el('aside', 'fm-reco');
    section.setAttribute('aria-label', 'Recommended departure');
    // Default to the earliest candidate departure date.
    function candDate(r) { return r.traveler_name || (r.arrival && r.arrival.date) || ''; }
    var pick = null, pickDate = '';
    candidates.forEach(function (r) {
      var d = candDate(r);
      if (!d) return;
      if (pick === null || d < pickDate) { pick = r; pickDate = d; }
    });
    if (pick === null) pick = candidates[0] || null;

    section.appendChild(el('h3', 'fm-sub-head', 'Recommended departure'));
    if (!pick) {
      section.appendChild(el('p', 'fm-muted', TIMING_UNVERIFIED));
      return section;
    }

    var depDate = pick.traveler_name || (pick.arrival && pick.arrival.date) || '2027-11-19';
    var verified = hasTiming(pick, live);
    section.appendChild(el('p', 'fm-reco-date', 'Provisional pick: depart ' + fmtDate(depDate) + ', 2027'));

    var lines = el('ul', 'fm-reco-rationale');
    // Line 1: price.
    if (verified && typeof pick.price_usd === 'number') {
      lines.appendChild(el('li', null, 'Fare: ' + usd(pick.price_usd) + ' per person on this date.'));
    } else {
      lines.appendChild(el('li', null, 'Fare: not verified until live fare data is available.'));
    }
    // Line 2: arrival time / jet lag.
    if (verified && pick.arrival && pick.arrival.date) {
      lines.appendChild(el('li', null, 'Arrives ' + fmtDate(pick.arrival.date) + ', leaving a buffer before the ' + fmtDate(LANDING_DATE) + ' landing target for jet-lag recovery.'));
    } else {
      lines.appendChild(el('li', null, 'Arrival timing not verified \u2013 November 2027 schedules are not published yet, so jet-lag buffer cannot be confirmed.'));
    }
    // Line 3: connection risk.
    if (verified && pick.short_connection) {
      lines.appendChild(el('li', null, 'Connection risk: a tight layover under 2 hours was detected; consider a later connection.'));
    } else if (verified) {
      lines.appendChild(el('li', null, 'Connection risk: layovers look comfortable (no tight connection flagged).'));
    } else {
      lines.appendChild(el('li', null, 'Connection risk cannot be assessed yet; defaulting to the earlier departure (Nov 19) to keep the most schedule flexibility.'));
    }
    section.appendChild(lines);
    var tb = timingBadges(pick);
    if (tb) section.appendChild(tb);
    return section;
  }

  function render(mount, snap, how) {
    var id = mount.getAttribute('data-itinerary');
    var itin = validSnapshot(snap) ? snap.itineraries[id] : null;
    var mode = itin ? snap.mode : 'missing';
    var live = mode === 'live';
    var rows = itin && Array.isArray(itin.rows) && itin.rows.length ? itin.rows : fallbackRows(mount);
    var thresholds = (snap && snap.thresholds) || { drop_pct: 10 };

    var travelers = itin && typeof itin.travelers === 'number' ? itin.travelers : 0;
    var globalSrc = mount.getAttribute('data-travelers-global');
    if (globalSrc) {
      var g = Number(globalPath(globalSrc));
      if (isFinite(g) && g >= 1) travelers = Math.floor(g);
    }

    mount.textContent = '';
    mount.classList.add('fm');

    // Meta: last checked + data source. Show the timestamp whenever the snapshot
    // carries one (live OR error "last good data"); only truly-unchecked snapshots
    // (e.g. no_api_key with last_checked null) say "Not checked yet".
    var meta = el('p', 'fm-meta');
    var hasChecked = !!(snap && snap.last_checked);
    var last = hasChecked ? fmtTime(snap.last_checked) : 'Not checked yet';
    meta.appendChild(el('span', null, 'Last checked: '));
    if (hasChecked) {
      var tm = el('time', null, last);
      tm.setAttribute('datetime', snap.last_checked);
      meta.appendChild(tm);
    } else {
      meta.appendChild(document.createTextNode(last));
    }
    meta.appendChild(document.createTextNode(' \u00b7 Data source: '));
    var srcName = (snap && snap.source && snap.source.name) || 'SerpApi Google Flights';
    var srcUrl = (snap && snap.source && snap.source.url) || 'https://serpapi.com/google-flights-api';
    if (mode === 'sample') {
      meta.appendChild(document.createTextNode('none (sample data hidden)'));
    } else if (isHttps(srcUrl)) {
      var sa = el('a', 'fm-link', srcName);
      sa.href = srcUrl;
      sa.target = '_blank';
      sa.rel = 'noopener noreferrer';
      sa.appendChild(el('span', 'fm-sr', ' (opens in a new tab)'));
      meta.appendChild(sa);
    } else {
      meta.appendChild(document.createTextNode(srcName));
    }
    mount.appendChild(meta);

    var status = el('p', 'fm-status');
    status.setAttribute('aria-live', 'polite');
    // When the snapshot carries a timestamp, weave it into the sentence; otherwise
    // say so plainly. The meta line above always also shows it and the source link.
    var when = snap && snap.last_checked ? fmtTime(snap.last_checked) : null;
    var checkedPhrase = when ? ('Last checked ' + when + '.') : 'Not checked yet.';
    if (mode === 'error' || (snap && snap.last_error)) {
      // API error: show when the check failed and a sanitised error type only.
      var failWhen = when ? ('Last check failed on ' + when) : 'The last check failed';
      status.textContent = failWhen + ' (' + errorType(snap) + '). Showing the last good data.';
    } else if (mode === 'live' && hasOkRow(rows)) {
      status.textContent = checkedPhrase + ' Fares shown are live from SerpApi Google Flights.';
    } else if (mode === 'live') {
      // Checked successfully but no fares published yet (all rows not verified).
      status.textContent = checkedPhrase + ' Airlines haven\u2019t published fares for Nov 2027 yet, so these routes show \u201cnot verified.\u201d';
    } else if (mode === 'sample') {
      status.textContent = 'This file contains sample data, so no prices are shown. All fares are not verified.';
    } else if (mode === 'no_api_key') {
      status.textContent = 'Live fare checks aren\u2019t switched on yet. No prices are estimated or invented.';
    } else {
      status.textContent = 'Flight data could not be loaded (the snapshot file is missing, empty, or blocked by the browser), so every fare is not verified. No prices are estimated or invented.';
    }
    mount.appendChild(status);

    // Candidate-departure rows feed the timing view + recommendation card; keep
    // them out of the fare table so each view reads cleanly.
    var candidates = [];
    var tableRows = [];
    rows.forEach(function (r) {
      if (r.kind === 'candidate') candidates.push(r);
      else tableRows.push(r);
    });
    if (candidates.length) {
      mount.appendChild(renderRecommendation(candidates, live));
      mount.appendChild(renderTimingView(candidates, live));
    }

    var wrap = el('div', 'fm-table-wrap');
    var table = el('table', 'fm-table');
    var cap = el('caption', 'fm-sr', 'Lowest round-trip fare per person by route and cabin, with change since the last check');
    table.appendChild(cap);
    var thead = el('thead');
    var hr = el('tr');
    ['Route', 'Cabin', 'Airline', 'Stops', 'Duration', 'Price/person', 'Change', 'Checked'].forEach(function (h) {
      var th = el('th', null, h);
      th.setAttribute('scope', 'col');
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el('tbody');
    var ctx = { live: live, travelers: travelers, thresholds: thresholds };
    tableRows.forEach(function (r) { tbody.appendChild(renderRow(r, ctx)); });
    table.appendChild(tbody);
    wrap.appendChild(table);
    mount.appendChild(wrap);

    var note = el('p', 'fm-note');
    var dates = itin ? 'Dates priced: depart ' + fmtDate(itin.outbound_date) + ', return ' + fmtDate(itin.return_date) + ' (assumed). ' : '';
    note.textContent = dates + 'Prices are per person, in USD, taxes included, and shown only when the data source returned them. Airline, stops, duration and layovers describe the outbound trip; the price covers the round trip (open-jaw where arrival and departure airports differ). The link opens a Google Flights search, so the fare there can differ. Alternate origins appear only when at least $' + (thresholds.alt_origin_usd || 300) + ' cheaper than STL.';
    mount.appendChild(note);
    mount.setAttribute('data-fm-state', how || mode);
  }

  function mountOne(mount) {
    render(mount, window.FLIGHT_MONITOR_DATA, 'embedded');
    if (typeof fetch !== 'function') return;
    fetch(JSON_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (data) {
        if (!validSnapshot(data)) return;
        var cur = window.FLIGHT_MONITOR_DATA;
        if (!validSnapshot(cur) || String(data.generated_at) >= String(cur.generated_at)) {
          window.FLIGHT_MONITOR_DATA = data;
          render(mount, data, 'fetched');
        }
      })
      .catch(function () { /* file:// or offline: keep the embedded/fallback rendering */ });
  }

  function init() {
    var mounts = document.querySelectorAll('[data-flight-monitor]');
    for (var i = 0; i < mounts.length; i++) mountOne(mounts[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

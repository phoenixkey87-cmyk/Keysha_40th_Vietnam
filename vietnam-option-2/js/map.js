/* VIETNAM OPTION 2 interactive map. Leaflet 1.9.4 (vendored) + OpenStreetMap tiles.
   Falls back to a list of Google Maps links if the library or tiles fail. */
(function () {
  'use strict';
  var V = window.VO2, D = V && V.data;
  var host = document.getElementById('mapBody');
  if (!V || !host || !D || !Array.isArray(D.mappoints)) return;

  var el = V.el;
  var CATS = [['all', 'All'], ['hotel', 'Hotels'], ['dining', 'Dining'], ['nightlife', 'Nightlife'], ['cafe', 'Cafés'], ['shopping', 'Shopping'], ['medical', 'Wellness']];
  var CITIES = ['Da Nang', 'Ho Chi Minh City'];
  var city = CITIES[0], cat = 'all';
  var map = null, layer = null, tileErrors = 0, tilesOk = false;

  host.appendChild(el('p', { cls: 'notice', attrs: { role: 'note' }, text: 'Pins marked approximate are area-level estimates, so use the Google Maps link in each popup to confirm the exact location. Map tiles are loaded from OpenStreetMap.' }));

  var cityRow = el('div', { cls: 'chip-row', attrs: { role: 'group', 'aria-label': 'City' } });
  var catRow = el('div', { cls: 'chip-row', attrs: { role: 'group', 'aria-label': 'Category' } });
  var cityBtns = {}, catBtns = {};
  CITIES.forEach(function (c) {
    var b = el('button', { cls: 'chip', text: c, attrs: { type: 'button', 'aria-pressed': String(c === city) }, on: { click: function () { city = c; render(); } } });
    cityBtns[c] = b; cityRow.appendChild(b);
  });
  CATS.forEach(function (c) {
    var b = el('button', { cls: 'chip', text: c[1], attrs: { type: 'button', 'aria-pressed': String(c[0] === cat) }, on: { click: function () { cat = c[0]; render(); } } });
    catBtns[c[0]] = b; catRow.appendChild(b);
  });
  host.appendChild(cityRow);
  host.appendChild(catRow);

  var status = el('p', { cls: 'small', attrs: { role: 'status' }, text: 'Loading map...' });
  host.appendChild(status);
  var mapEl = el('div', { cls: 'map-canvas', attrs: { id: 'vo2Map', role: 'region', 'aria-label': 'Map of hotels, dining, nightlife and cafés' } });
  host.appendChild(mapEl);
  var listBox = el('div', { cls: 'map-list' });
  host.appendChild(listBox);

  function visible() {
    return D.mappoints.filter(function (p) { return p.city === city && (cat === 'all' || p.category === cat); });
  }
  function gmaps(p) {
    return p.googleMapsUrl || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.name + ', ' + p.city));
  }

  function renderList(showAsFallback) {
    listBox.textContent = '';
    var pts = visible();
    listBox.appendChild(el('h3', { text: showAsFallback ? 'Places as Google Maps links' : 'Places on the map (' + pts.length + ')' }));
    if (!pts.length) { listBox.appendChild(el('p', { text: 'No places in this category for this city.' })); return; }
    var ul = el('ul', { cls: 'map-links' });
    pts.forEach(function (p) {
      var li = el('li');
      li.appendChild(el('a', { text: p.name, attrs: { href: gmaps(p), target: '_blank', rel: 'noopener noreferrer' } }));
      li.appendChild(document.createTextNode(' (' + p.category + (p.coordAccuracy === 'approximate' ? ', approximate pin' : '') + ')'));
      ul.appendChild(li);
    });
    listBox.appendChild(ul);
  }

  function popupNode(p) {
    var box = el('div', { cls: 'map-popup' });
    box.appendChild(el('strong', { text: p.name }));
    box.appendChild(el('div', { text: p.category + ', ' + p.city }));
    if (p.coordAccuracy === 'approximate') box.appendChild(el('div', { text: 'Approximate pin. Confirm with Google Maps.' }));
    box.appendChild(el('a', { text: 'Open in Google Maps', attrs: { href: gmaps(p), target: '_blank', rel: 'noopener noreferrer' } }));
    return box;
  }

  function fallback(reason) {
    mapEl.hidden = true;
    status.textContent = reason + ' Showing Google Maps links instead.';
    renderList(true);
  }

  function render() {
    Object.keys(cityBtns).forEach(function (k) { cityBtns[k].setAttribute('aria-pressed', String(k === city)); });
    Object.keys(catBtns).forEach(function (k) { catBtns[k].setAttribute('aria-pressed', String(k === cat)); });
    if (!map) { renderList(true); return; }
    layer.clearLayers();
    var pts = visible(), bounds = [];
    pts.forEach(function (p) {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
      var m = window.L.marker([p.lat, p.lng], { title: p.name, alt: p.name, keyboard: true });
      m.bindPopup(popupNode(p));
      layer.addLayer(m);
      bounds.push([p.lat, p.lng]);
    });
    var c = (D.mapCenters || {})[city];
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    else if (bounds.length === 1) map.setView(bounds[0], 15);
    else if (c) map.setView([c.lat, c.lng], c.zoom);
    status.textContent = pts.length + ' place' + (pts.length === 1 ? '' : 's') + ' shown in ' + city + '.';
    renderList(false);
  }

  function init() {
    if (!window.L || typeof window.L.map !== 'function') { fallback('The map library could not be loaded.'); return; }
    try {
      var c0 = (D.mapCenters || {})[city] || { lat: 16.05, lng: 108.24, zoom: 12 };
      map = window.L.map(mapEl, { scrollWheelZoom: false }).setView([c0.lat, c0.lng], c0.zoom);
      var tiles = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      tiles.on('tileload', function () { tilesOk = true; });
      tiles.on('tileerror', function () {
        tileErrors++;
        if (!tilesOk && tileErrors >= 4) {
          status.textContent = 'Map tiles could not be loaded. Pins and Google Maps links below still work.';
          renderList(true);
        }
      });
      tiles.addTo(map);
      layer = window.L.layerGroup().addTo(map);
      render();
      // The map sits in a section that may be laid out later; refresh size once visible.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
          if (es[0].isIntersecting) { map.invalidateSize(); io.disconnect(); }
        });
        io.observe(mapEl);
      }
    } catch (e) {
      map = null;
      fallback('The map could not start.');
    }
  }

  // Load the vendored Leaflet lazily; failure shows the link list.
  var css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = 'vietnam-option-2/js/vendor/leaflet/leaflet.css';
  document.head.appendChild(css);
  var s = document.createElement('script');
  s.src = 'vietnam-option-2/js/vendor/leaflet/leaflet.js';
  s.onload = init;
  s.onerror = function () { fallback('The map library could not be loaded.'); };
  document.head.appendChild(s);
})();

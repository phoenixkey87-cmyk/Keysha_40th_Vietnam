/* VIETNAM OPTION 2 core: helpers, navigation, theme, hero, countdown, itinerary,
   birthday banner, wishlist and print. Plain script (no modules) so file:// works.
   All data strings are rendered with textContent. */
(function () {
  'use strict';

  var DATA = window.VO2_DATA || {};
  var BIRTHDAY = new Date('2027-11-23T00:00:00+07:00').getTime();
  var DAY_MS = 24 * 60 * 60 * 1000;
  var FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="120" height="80" fill="#0b4d3a"/>' +
    '<text x="60" y="46" font-family="Georgia,serif" font-size="14" fill="#ead9a8" text-anchor="middle">VO2</text></svg>');

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- storage ---------- */
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- helpers ---------- */
  function el(tag, opts, children) {
    var node = document.createElement(tag);
    opts = opts || {};
    if (opts.cls) node.className = opts.cls;
    if (opts.text !== undefined && opts.text !== null) node.textContent = opts.text;
    if (opts.attrs) Object.keys(opts.attrs).forEach(function (k) {
      if (opts.attrs[k] !== null && opts.attrs[k] !== undefined) node.setAttribute(k, opts.attrs[k]);
    });
    if (opts.on) Object.keys(opts.on).forEach(function (k) { node.addEventListener(k, opts.on[k]); });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  var STATUS_LABELS = {
    verified: 'Verified', estimated: 'Estimated', proposed: 'Proposed', pending: 'Estimated',
    tentative: 'Proposed', confirmed: 'Confirmed'
  };
  function statusBadge(status) {
    var key = STATUS_LABELS[status] ? status : 'estimated';
    if (key === 'pending') key = 'estimated';
    if (key === 'tentative') key = 'proposed';
    return el('span', { cls: 'badge badge-' + key, text: STATUS_LABELS[key] });
  }

  function fmtUSD(n) {
    if (n === null || n === undefined || isNaN(Number(n))) return 'Enter your quote';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n));
  }

  /* Image with loading shimmer and error fallback. */
  function imageEl(src, alt, opts) {
    opts = opts || {};
    var wrap = el('div', { cls: 'img-wrap' + (opts.cls ? ' ' + opts.cls : '') });
    var img = el('img', { attrs: { src: src, alt: alt || '', loading: opts.eager ? 'eager' : 'lazy', decoding: 'async' } });
    wrap.appendChild(img);
    if (img.complete && img.naturalWidth) wrap.classList.add('loaded');
    return wrap;
  }
  // Global load/error handling (capture phase because these events do not bubble).
  document.addEventListener('load', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('img-wrap')) {
      t.parentNode.classList.add('loaded');
    }
  }, true);
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG' || t.getAttribute('data-fallback')) return;
    t.setAttribute('data-fallback', '1');
    t.src = FALLBACK_IMG;
    if (!t.getAttribute('alt')) t.setAttribute('alt', 'Image unavailable');
    if (t.parentNode && t.parentNode.classList) t.parentNode.classList.add('img-failed', 'loaded');
  }, true);

  /* ---------- lookup across all data collections ---------- */
  var COLLECTIONS = [
    ['itinerary', 'Itinerary day', '#itinerary'], ['hotels', 'Hotel', '#hotels'], ['dining', 'Restaurant', '#dining'],
    ['nightlife', 'Nightlife', '#nightlife'], ['cafes', 'Café', '#cafes'], ['shopping', 'Shopping', '#shopping'],
    ['medical', 'Wellness', '#wellness']
  ];
  function lookup(id) {
    for (var i = 0; i < COLLECTIONS.length; i++) {
      var list = DATA[COLLECTIONS[i][0]];
      if (!Array.isArray(list)) continue;
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === id) {
          var rec = list[j];
          return { record: rec, type: COLLECTIONS[i][1], anchor: COLLECTIONS[i][2],
                   name: rec.name || (rec.date ? formatDate(rec.date) + ': ' + rec.theme : id) };
        }
      }
    }
    return null;
  }
  function formatDate(iso) {
    var p = iso.split('-');
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  /* ---------- wishlist store ---------- */
  var wishlist = (function () {
    var ids = load('vo2_wishlist', []);
    if (!Array.isArray(ids)) ids = [];
    var subs = [];
    function emit() { save('vo2_wishlist', ids); subs.forEach(function (fn) { fn(ids.slice()); }); }
    return {
      add: function (id) { if (ids.indexOf(id) === -1) { ids.push(id); emit(); } },
      remove: function (id) { var i = ids.indexOf(id); if (i !== -1) { ids.splice(i, 1); emit(); } },
      clear: function () { ids = []; emit(); },
      has: function (id) { return ids.indexOf(id) !== -1; },
      all: function () { return ids.slice(); },
      subscribe: function (fn) { subs.push(fn); fn(ids.slice()); }
    };
  })();

  function heartButton(id, name) {
    var btn = el('button', { cls: 'heart-btn', attrs: { type: 'button', 'data-heart': id, 'aria-pressed': String(wishlist.has(id)), 'aria-label': 'Save ' + name + ' to wishlist' }, text: '\u2665' });
    btn.addEventListener('click', function () {
      if (wishlist.has(id)) wishlist.remove(id); else wishlist.add(id);
    });
    return btn;
  }
  wishlist.subscribe(function () {
    var nodes = document.querySelectorAll('[data-heart]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute('aria-pressed', String(wishlist.has(nodes[i].getAttribute('data-heart'))));
    }
  });

  window.VO2 = {
    data: DATA, el: el, statusBadge: statusBadge, fmtUSD: fmtUSD, imageEl: imageEl, lookup: lookup,
    heartButton: heartButton, wishlist: wishlist, load: load, save: save, reducedMotion: reducedMotion,
    formatDate: formatDate, buildDayScroller: buildDayScroller, confetti: function () { burstConfetti(); }
  };

  document.documentElement.classList.add('js');

  /* ---------- mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var navMenu = document.getElementById('navMenu');
  function setMenu(open, returnFocus) {
    navMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      var first = navMenu.querySelector('a');
      if (first) first.focus();
    } else if (returnFocus) {
      menuToggle.focus();
    }
  }
  menuToggle.addEventListener('click', function () { setMenu(menuToggle.getAttribute('aria-expanded') !== 'true', true); });
  navMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', function (e) {
    if (menuToggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.nav')) setMenu(false, false);
  });

  /* ---------- smooth scroll (CSS handles motion preference; this fixes focus) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  /* ---------- reveal + active nav ---------- */
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
    }, { threshold: 0 });
    document.querySelectorAll('.reveal').forEach(function (n) { revealIO.observe(n); });

    var links = {};
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
        var l = links[en.target.id];
        if (l) { l.classList.add('active'); l.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { navIO.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (n) { n.classList.add('in'); });
  }

  /* ---------- theme ---------- */
  var themeToggle = document.getElementById('themeToggle');
  function applyTheme(t, persist) {
    document.documentElement.setAttribute('data-theme', t);
    themeToggle.setAttribute('aria-pressed', String(t === 'dark'));
    document.getElementById('themeLabel').textContent = t === 'dark' ? 'Light' : 'Dark';
    document.getElementById('themeIcon').textContent = t === 'dark' ? '\u2600' : '\u263E';
    themeToggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (persist) { try { localStorage.setItem('vo2_theme', t); } catch (e) { /* ignore */ } }
  }
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
  themeToggle.addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  /* ---------- hero intro ---------- */
  var SCENES = [
    { src: 'vietnam-option-2/images/hero/my-khe-beach.jpg', text: "Da Nang's luxury coastline", label: 'Da Nang coastline' },
    { src: 'vietnam-option-2/images/hero/danang-skyline.jpg', text: 'Da Nang from the sea to the Han River', label: 'Da Nang skyline' },
    { src: 'vietnam-option-2/images/hero/saigon-skyline.jpg', text: "Ho Chi Minh City's skyline", label: 'Ho Chi Minh City skyline' },
    { src: 'vietnam-option-2/images/hero/saigon-night.jpg', text: 'Saigon after dark', label: 'Saigon at night' }
  ];
  (function heroIntro() {
    var slidesBox = document.getElementById('heroSlides');
    var dotsBox = document.getElementById('heroDots');
    var intro = document.getElementById('heroIntro');
    var current = 0, timer = null;
    var slides = SCENES.map(function (s, i) {
      var slide = el('div', { cls: 'hero-slide' + (i === 0 ? ' active' : '') });
      slide.appendChild(el('img', { attrs: { src: s.src, alt: '', loading: i === 0 ? 'eager' : 'lazy', decoding: 'async' } }));
      slidesBox.appendChild(slide);
      return slide;
    });
    var dots = SCENES.map(function (s, i) {
      var d = el('button', { cls: 'hero-dot', attrs: { type: 'button', 'aria-label': 'Show scene: ' + s.label, 'aria-current': String(i === 0) } });
      d.addEventListener('click', function () { show(i); restart(); });
      dotsBox.appendChild(d);
      return d;
    });
    intro.textContent = SCENES[0].text;
    function show(i) {
      current = (i + SCENES.length) % SCENES.length;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === current); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', String(k === current)); });
      intro.classList.add('fade');
      setTimeout(function () { intro.textContent = SCENES[current].text; intro.classList.remove('fade'); }, reducedMotion() ? 0 : 400);
    }
    function restart() {
      if (timer) clearInterval(timer);
      if (!reducedMotion()) timer = setInterval(function () { show(current + 1); }, 6500);
    }
    restart();
  })();

  /* ---------- countdown ---------- */
  (function countdown() {
    var grid = document.getElementById('countdownGrid');
    var msg = document.getElementById('countdownMsg');
    var ids = { d: 'cdDays', h: 'cdHours', m: 'cdMins', s: 'cdSecs' };
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var diff = BIRTHDAY - Date.now();
      if (diff <= 0) {
        grid.hidden = true; msg.hidden = false;
        msg.textContent = diff > -DAY_MS ? "Happy 40th Birthday, Key! Today is the day." : 'The birthday on November 23, 2027 has passed. We hope it was fabulous.';
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      document.getElementById(ids.d).textContent = String(Math.floor(s / 86400));
      document.getElementById(ids.h).textContent = pad(Math.floor((s % 86400) / 3600));
      document.getElementById(ids.m).textContent = pad(Math.floor((s % 3600) / 60));
      document.getElementById(ids.s).textContent = pad(s % 60);
    }
    var timer = setInterval(tick, 1000);
    tick();
  })();

  /* ---------- itinerary ---------- */
  function sectionLink(linkedId) {
    var info = lookup(linkedId);
    if (!info) return null;
    return el('a', { cls: 'act-link', text: 'See ' + info.name, attrs: { href: info.anchor } });
  }

  /* Turn a vertical list of day cells into a horizontally scrollable, scroll-snap
     row with prev/next arrow buttons and keyboard support. ES5 only. */
  function buildDayScroller(list, isReducedMotion, cellSelector) {
    if (!list || !list.parentNode) return;
    cellSelector = cellSelector || '.day';
    // Wrap the list in a positioned frame that also holds the arrow buttons.
    var frame = el('div', { cls: 'day-scroller' });
    list.parentNode.insertBefore(frame, list);
    list.classList.add('day-scroller-track');
    frame.appendChild(list);

    function makeArrow(dir, label) {
      return el('button', { cls: 'day-scroll-btn day-scroll-' + dir, attrs: { type: 'button', 'aria-label': label } }, [
        el('span', { cls: 'day-scroll-icon', attrs: { 'aria-hidden': 'true' } })
      ]);
    }
    var prev = makeArrow('prev', 'Scroll to previous day');
    var next = makeArrow('next', 'Scroll to next day');
    frame.appendChild(prev);
    frame.appendChild(next);

    function cells() { return list.querySelectorAll(cellSelector); }
    function step() {
      var c = cells();
      if (!c.length) return list.clientWidth;
      // One cell width plus the gap between cells.
      var gap = 0;
      if (c.length > 1) gap = c[1].offsetLeft - (c[0].offsetLeft + c[0].offsetWidth);
      if (gap < 0) gap = 0;
      return c[0].offsetWidth + gap;
    }
    function behavior() { return (isReducedMotion && isReducedMotion()) ? 'auto' : 'smooth'; }
    function scrollByCells(n) {
      list.scrollBy({ left: n * step(), behavior: behavior() });
    }
    function updateButtons() {
      // A small tolerance: the scroll mask can leave scrollLeft a pixel or two off
      // zero at rest, so treat near-zero as the left end.
      var maxScroll = list.scrollWidth - list.clientWidth - 2;
      prev.disabled = list.scrollLeft <= 2;
      next.disabled = list.scrollLeft >= maxScroll;
    }
    prev.addEventListener('click', function () { scrollByCells(-1); });
    next.addEventListener('click', function () { scrollByCells(1); });
    list.addEventListener('scroll', updateButtons);
    if (window.addEventListener) window.addEventListener('resize', updateButtons);

    // Keyboard: Left/Right arrows move between day cells and keep focus with the cell.
    list.addEventListener('keydown', function (e) {
      var key = e.key || e.keyIdentifier;
      if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Right' && key !== 'Left') return;
      var c = cells();
      if (!c.length) return;
      var current = document.activeElement;
      var idx = -1, i;
      for (i = 0; i < c.length; i++) { if (c[i] === current) { idx = i; break; } }
      var dir = (key === 'ArrowRight' || key === 'Right') ? 1 : -1;
      var target = idx === -1 ? (dir > 0 ? 0 : c.length - 1) : idx + dir;
      if (target < 0 || target >= c.length) return;
      e.preventDefault();
      c[target].focus();
      c[target].scrollIntoView({ behavior: behavior(), inline: 'start', block: 'nearest' });
    });

    updateButtons();
    // Re-check once images/layout settle.
    if (window.setTimeout) window.setTimeout(updateButtons, 300);
  }

  (function itinerary() {
    var list = document.getElementById('itineraryList');
    var days = Array.isArray(DATA.itinerary) ? DATA.itinerary : [];
    if (!days.length) { list.appendChild(el('p', { text: 'Itinerary details are being updated.' })); return; }
    var heads = [];

    days.forEach(function (d) {
      var panelId = 'panel-' + d.id, headId = 'head-' + d.id;
      var head = el('button', { cls: 'day-head', attrs: { type: 'button', id: headId, 'aria-expanded': 'false', 'aria-controls': panelId } }, [
        el('span', { cls: 'day-date', text: formatDate(d.date) }),
        el('span', {}, [
          el('span', { cls: 'day-title', text: 'Day ' + d.dayNumber + ': ' + d.theme }),
          el('span', { cls: 'day-city', text: d.city })
        ]),
        el('span', { cls: 'day-meta' }, [statusBadge(d.tentative === false ? 'confirmed' : 'tentative'), el('span', { cls: 'day-chevron', attrs: { 'aria-hidden': 'true' } })])
      ]);
      var panel = el('div', { cls: 'day-panel', attrs: { id: panelId, role: 'region', 'aria-labelledby': headId, hidden: '' } });
      if (d.image) {
        var photo = el('figure', { cls: 'day-photo heart-host', attrs: { style: 'position:relative;margin:0' } });
        photo.appendChild(imageEl(d.image, d.imageAlt || ''));
        photo.appendChild(heartButton(d.id, formatDate(d.date) + ' ' + d.theme));
        panel.appendChild(photo);
      }
      if (d.note) panel.appendChild(el('p', { cls: 'day-note', text: d.note }));
      var ul = el('ul', { cls: 'timeline' });
      (d.activities || []).forEach(function (a) {
        var li = el('li', {}, [
          el('span', { cls: 'slot', text: a.slot }),
          el('span', { cls: 'act-title', text: a.title }),
          el('p', { cls: 'act-detail', text: a.detail || '' })
        ]);
        if (a.linkedId) { var l = sectionLink(a.linkedId); if (l) li.appendChild(l); }
        ul.appendChild(li);
      });
      panel.appendChild(ul);
      head.addEventListener('click', function () { setDay(head, head.getAttribute('aria-expanded') !== 'true'); });
      list.appendChild(el('div', { cls: 'day' + (d.isBirthday ? ' birthday' : ''), attrs: { id: d.id, tabindex: '0' } }, [head, panel]));
      heads.push(head);
    });

    function setDay(head, open) {
      head.setAttribute('aria-expanded', String(open));
      var panel = document.getElementById(head.getAttribute('aria-controls'));
      if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
    }
    document.getElementById('expandAll').addEventListener('click', function () { heads.forEach(function (h) { setDay(h, true); }); });
    document.getElementById('collapseAll').addEventListener('click', function () { heads.forEach(function (h) { setDay(h, false); }); });
    window.addEventListener('beforeprint', function () { heads.forEach(function (h) { setDay(h, true); }); });

    /* Horizontal scroll-snap row with prev/next arrows + keyboard support.
       The .day tiles become equal-width cells; arrows scroll by one cell. */
    buildDayScroller(list, reducedMotion);
  })();

  /* ---------- birthday banner + featured La Maison 1888 ---------- */
  (function birthday() {
    var box = document.getElementById('birthdayFeature');
    var day = (DATA.itinerary || []).filter(function (d) { return d.isBirthday; })[0];
    if (!day) return;
    var banner = el('div', { cls: 'birthday-banner' }, [
      el('p', { cls: 'eyebrow', text: 'November 23, 2027 · Da Nang' }),
      el('h3', { text: "Happy 40th Birthday, Key!" }),
      el('p', { text: 'The most special day of the trip: a birthday spa experience, professional photographs, a candlelit dinner and cocktails afterward. Everything is proposed and subject to availability and budget.' })
    ]);
    var open = el('a', { cls: 'btn btn-gold', text: 'See the birthday plan', attrs: { href: '#' + day.id } });
    open.addEventListener('click', function () {
      var head = document.getElementById('head-' + day.id);
      if (head && head.getAttribute('aria-expanded') !== 'true') head.click();
    });
    banner.appendChild(open);
    if (!reducedMotion()) {
      var celebrate = el('button', { cls: 'btn btn-ghost', text: 'Celebrate', attrs: { type: 'button' } });
      celebrate.addEventListener('click', burstConfetti);
      banner.appendChild(document.createTextNode(' '));
      banner.appendChild(celebrate);
    }

    var r = (DATA.dining || []).filter(function (x) { return x.id === 'dine-la-maison-1888'; })[0];
    if (r) {
      var badges = el('div', { cls: 'badge-row' }, [statusBadge('proposed')]);
      if (r.michelin && r.michelin.status) {
        var mb = statusBadge(r.michelin.status);
        mb.textContent = 'Michelin: ' + mb.textContent;
        badges.appendChild(mb);
      }
      var body = el('div', { cls: 'card-body' }, [
        badges,
        el('h3', { text: r.name + ', ' + r.city }),
        el('p', { text: 'Proposed birthday dinner on November 23, 2027, subject to reservation availability and budget. Nothing is booked.' })
      ]);
      var dl = el('dl');
      [['Cuisine', r.cuisine], ['Where', r.location], ['Dress code', r.dressCode && r.dressCode.text],
       ['Menu', r.menu && r.menu.text], ['Menu notice', r.menu && r.menu.notice],
       ['Reservation terms', r.deposit && r.deposit.text], ['Michelin', r.michelin && r.michelin.text]].forEach(function (row) {
        if (!row[1]) return;
        dl.appendChild(el('dt', { text: row[0] }));
        dl.appendChild(el('dd', { text: row[1] }));
      });
      body.appendChild(dl);
      if (r.reservationUrl) {
        body.appendChild(el('a', { cls: 'btn btn-outline', text: 'Reservation information', attrs: { href: r.reservationUrl, target: '_blank', rel: 'noopener noreferrer' } }));
      }
      var imgWrap = imageEl(r.image, r.imageAlt || '');
      var card = el('article', { cls: 'featured-card', attrs: { 'aria-label': 'Featured restaurant: ' + r.name } }, [
        el('div', {}, [imgWrap, r.imageNote ? el('p', { cls: 'img-caption', text: r.imageNote }) : null]),
        body
      ]);
      card.appendChild(heartButton(r.id, r.name));
      banner.appendChild(card);
    }
    box.appendChild(banner);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); burstConfetti(); }
      }, { threshold: 0.5 });
      io.observe(banner);
    }
  })();

  /* ---------- confetti ---------- */
  function burstConfetti() {
    if (reducedMotion()) return;
    var canvas = document.getElementById('confetti');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width = window.innerWidth, h = canvas.height = window.innerHeight;
    var colors = ['#c9a24b', '#ead9a8', '#b76e79', '#0b4d3a', '#fffdf8'];
    var parts = [];
    for (var i = 0; i < 140; i++) {
      parts.push({ x: Math.random() * w, y: -20 - Math.random() * h * 0.4, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
                   s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length] });
    }
    var start = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, w, h);
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (now - start < 4500) requestAnimationFrame(frame); else ctx.clearRect(0, 0, w, h);
    })(start);
  }

  /* ---------- wishlist drawer ---------- */
  (function drawer() {
    var btn = document.getElementById('wishlistBtn');
    var panel = document.getElementById('wishlistDrawer');
    var backdrop = document.getElementById('drawerBackdrop');
    var closeBtn = document.getElementById('wishlistClose');
    var listEl = document.getElementById('wishlistList');
    var emptyEl = document.getElementById('wishlistEmpty');
    var countEl = document.getElementById('wishlistCount');
    var countSr = document.getElementById('wishlistCountSr');
    var clearBtn = document.getElementById('wishlistClear');

    function render(ids) {
      while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
      var shown = 0;
      ids.forEach(function (id) {
        var info = lookup(id);
        var name = info ? info.name : id;
        shown++;
        var rm = el('button', { cls: 'btn btn-outline', text: 'Remove', attrs: { type: 'button', 'aria-label': 'Remove ' + name + ' from wishlist' } });
        rm.addEventListener('click', function () { wishlist.remove(id); });
        listEl.appendChild(el('li', {}, [
          el('span', {}, [el('span', { cls: 'wish-name', text: name }), el('span', { cls: 'wish-type', text: info ? info.type : 'Saved item' })]),
          rm
        ]));
      });
      emptyEl.hidden = shown > 0;
      clearBtn.hidden = shown === 0;
      countEl.textContent = String(ids.length);
      countSr.textContent = ids.length + ' saved ' + (ids.length === 1 ? 'item' : 'items');
    }
    wishlist.subscribe(render);

    function openDrawer() {
      panel.hidden = false; backdrop.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }
    function closeDrawer() {
      panel.hidden = true; backdrop.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
    btn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    clearBtn.addEventListener('click', function () { wishlist.clear(); });
    document.addEventListener('keydown', function (e) {
      if (panel.hidden) return;
      if (e.key === 'Escape') { closeDrawer(); return; }
      if (e.key === 'Tab') {
        var f = panel.querySelectorAll('button:not([hidden])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();

  /* ---------- print ---------- */
  document.getElementById('printBtn').addEventListener('click', function () { window.print(); });

  /* ---------- Original | Option 2 toggle: carry the current day across the jump ----------
     Dates Nov 23-29 line up by date in both trips (shared id scheme day-2027-11-DD).
     Nov 21-22 are different trips and must NOT carry over (fall back to top). */
  (function itinerarySwitch() {
    function dayCarries(id) {
      // id like day-2027-11-DD; carry only DD in 23..29.
      var m = /^day-2027-11-(\d{2})$/.exec(id || '');
      if (!m) return false;
      var dd = parseInt(m[1], 10);
      return dd >= 23 && dd <= 29;
    }
    function currentDayId() {
      var cells = document.querySelectorAll('#itineraryList .day');
      if (!cells.length) return null;
      var best = null, bestDist = Infinity, i, r, dist;
      for (i = 0; i < cells.length; i++) {
        r = cells[i].getBoundingClientRect();
        // Distance of the cell's left edge from the viewport left; nearest = current.
        dist = Math.abs(r.left);
        if (dist < bestDist) { bestDist = dist; best = cells[i]; }
      }
      return best ? best.id : null;
    }
    // Carry the current day on the link to the Original itinerary.
    var orig = document.getElementById('switchOriginal');
    if (orig) {
      var base = orig.getAttribute('href');
      orig.addEventListener('click', function () {
        var id = currentDayId();
        orig.setAttribute('href', base + (dayCarries(id) ? '#' + id : ''));
      });
    }
    // On load, if arriving with a carried day hash, scroll the horizontal row to it.
    function scrollToHashDay() {
      var hash = (window.location.hash || '').replace('#', '');
      if (!dayCarries(hash)) return;
      var cell = document.getElementById(hash);
      if (!cell) return;
      var behavior = reducedMotion() ? 'auto' : 'smooth';
      cell.scrollIntoView({ behavior: behavior, inline: 'start', block: 'nearest' });
      // Also bring the section into vertical view.
      var section = document.getElementById('itinerary');
      if (section) section.scrollIntoView({ behavior: behavior, block: 'start' });
    }
    if (window.location.hash) {
      if (window.requestAnimationFrame) window.requestAnimationFrame(scrollToHashDay);
      else window.setTimeout(scrollToHashDay, 60);
    }
  })();
})();

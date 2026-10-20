/* Avenir Solutions - site behaviour (no dependencies) */
(function () {
  'use strict';
  var BASE = (function () { var s = (document.currentScript && document.currentScript.src) || ''; return s.replace(/assets\/js\/site\.js.*$/, ''); })();
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* header + back to top */
  var head = $('.site-head'), totop = $('.totop');
  function onScroll() {
    var y = window.scrollY || 0;
    if (head) head.classList.toggle('solid', y > 40);
    if (totop) totop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* full screen menu */
  var menu = $('.menu');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { setMenu(true); }); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setDrawer(false); } });

  /* reveal on scroll */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* tabs (materials) */
  $$('[data-tabs]').forEach(function (box) {
    var btns = $$('[role=tab]', box), panels = $$('[role=tabpanel]', box);
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x, j) { x.setAttribute('aria-selected', i === j ? 'true' : 'false'); });
        panels.forEach(function (p, j) { p.hidden = i !== j; });
      });
    });
  });

  /* ---------- inquiry list (stored in this browser only) ---------- */
  var KEY = 'avenir_inquiry';
  function getList() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function saveList(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} render(); }
  var drawer = $('.drawer'), overlay = $('.overlay'), fabN = $('.inq-fab .n'), listEl = $('.drawer .dl');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open); overlay.classList.toggle('open', open);
  }
  $$('[data-drawer-open]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(true); }); });
  $$('[data-drawer-close]').forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });
  if (overlay) overlay.addEventListener('click', function () { setDrawer(false); });
  function toast(msg) {
    var t = $('.toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function addItem(name, detail, qty) {
    var l = getList(), found = null;
    l.forEach(function (it) { if (it.name === name && it.detail === detail) found = it; });
    if (found) found.qty = (found.qty || 1) + (qty || 1); else l.push({ name: name, detail: detail || '', qty: qty || 1 });
    saveList(l); toast('Added to inquiry: ' + name);
  }
  function render() {
    var l = getList();
    if (fabN) fabN.textContent = l.length;
    if (!listEl) return;
    if (!l.length) { listEl.innerHTML = '<div class="empty">Your inquiry list is empty.<br>Use "Add to Inquiry" on any product or service.</div>'; return; }
    listEl.innerHTML = '<ul>' + l.map(function (it, i) {
      return '<li><div><b>' + esc(it.name) + '</b>' + (it.detail ? '<span>' + esc(it.detail) + '</span>' : '') + '<span>Qty: ' + it.qty + '</span></div><button data-rm="' + i + '">Remove</button></li>';
    }).join('') + '</ul>';
    $$('[data-rm]', listEl).forEach(function (b) {
      b.addEventListener('click', function () { var l2 = getList(); l2.splice(+b.getAttribute('data-rm'), 1); saveList(l2); });
    });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]'); if (!b) return;
    e.preventDefault();
    var qtyEl = b.getAttribute('data-qty-from') ? $(b.getAttribute('data-qty-from')) : null;
    addItem(b.getAttribute('data-add'), b.getAttribute('data-detail') || '', qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1);
  });
  var clearBtn = $('[data-inq-clear]'); if (clearBtn) clearBtn.addEventListener('click', function () { saveList([]); });
  var sendBtn = $('[data-inq-send]');
  if (sendBtn) sendBtn.addEventListener('click', function () {
    var l = getList(); if (!l.length) { toast('Your inquiry list is empty.'); return; }
    try { sessionStorage.setItem('avenir_prefill', l.map(function (it) { return '- ' + it.name + (it.detail ? ' (' + it.detail + ')' : '') + ' x ' + it.qty; }).join('\n')); } catch (e) {}
    window.location.href = BASE + 'contact/';
  });
  render();

  /* qty steppers */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]'); if (!b) return;
    var s = b.parentNode.querySelector('span'), v = parseInt(s.textContent, 10) || 1;
    v = Math.max(1, v + parseInt(b.getAttribute('data-step'), 10)); s.textContent = v;
  });

  /* ---------- price filter (camlock) ---------- */
  var pf = $('[data-pricefilter]');
  if (pf) {
    var rows = $$('tbody tr', pf), count = $('[data-count]', pf);
    var groups = $$('[data-group]', pf);
    function apply() {
      var sel = {};
      groups.forEach(function (g) {
        var k = g.getAttribute('data-group'); sel[k] = $$('button.on', g).map(function (b) { return b.textContent.trim(); });
      });
      var n = 0;
      rows.forEach(function (r) {
        var ok = Object.keys(sel).every(function (k) { return !sel[k].length || sel[k].indexOf(r.getAttribute('data-' + k)) > -1; });
        r.hidden = !ok; if (ok) n++;
      });
      if (count) count.textContent = n;
    }
    groups.forEach(function (g) {
      $$('button.chip', g).forEach(function (b) { b.addEventListener('click', function () { b.classList.toggle('on'); apply(); }); });
      var all = $('[data-all]', g), none = $('[data-none]', g);
      if (all) all.addEventListener('click', function () { $$('button.chip', g).forEach(function (b) { b.classList.add('on'); }); apply(); });
      if (none) none.addEventListener('click', function () { $$('button.chip', g).forEach(function (b) { b.classList.remove('on'); }); apply(); });
    });
    apply();
  }

  /* ---------- contact form ---------- */
  var form = $('#contact-form');
  if (form) {
    try {
      var pre = sessionStorage.getItem('avenir_prefill');
      if (pre) { var m = form.querySelector('[name=message]'); if (m && !m.value) m.value = 'Inquiry list:\n' + pre + '\n\n'; sessionStorage.removeItem('avenir_prefill'); }
    } catch (e) {}
    form.addEventListener('submit', function (e) {
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint && endpoint.indexOf('http') === 0) return; /* normal POST to the configured form service */
      e.preventDefault();
      var f = function (n) { return (form.querySelector('[name=' + n + ']') || {}).value || ''; };
      var body = 'Company Name: ' + f('companyName') + '\nContact Name: ' + f('contactName') + '\nEmail Address: ' + f('email') + '\nPhone Number: ' + f('phone') + '\n\nMessage / Details:\n' + f('message');
      window.location.href = 'mailto:' + (form.getAttribute('data-mailto') || 'info@avenirbharat.com') + '?subject=' + encodeURIComponent('Website inquiry from ' + f('companyName')) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ---------- material weight calculator ---------- */
  var calc = $('[data-calc]');
  if (calc) {
    var DENS = JSON.parse(calc.getAttribute('data-densities'));
    var SHAPES = {
      'Sheet / Plate': ['Length', 'Width', 'Thickness'],
      'Round Rod / Bar': ['Diameter', 'Length'],
      'Pipe / Tube': ['Outer Diameter (OD)', 'Inner Diameter (ID)', 'Length'],
      'Square Bar': ['Width', 'Height', 'Length'],
      'Hex Bar': ['Across Flats (Width)', 'Length'],
      'Ring': ['Outer Diameter (OD)', 'Inner Diameter (ID)', 'Thickness'],
      'Block / Cube': ['Length', 'Width', 'Height']
    };
    var UNIT = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254 };
    var matSel = $('[name=material]', calc), den = $('[name=density]', calc), unitSel = $('[name=unit]', calc), qtyIn = $('[name=quantity]', calc);
    var shapeBtns = $$('.shapes button', calc), dims = $('.dims', calc), out = $('.res .body', calc), shape = 'Sheet / Plate';
    matSel.addEventListener('change', function () { if (DENS[matSel.value] != null) den.value = DENS[matSel.value]; compute(); });
    den.addEventListener('input', compute); unitSel.addEventListener('change', function () { renderDims(); compute(); }); qtyIn.addEventListener('input', compute);
    shapeBtns.forEach(function (b) { b.addEventListener('click', function () { shapeBtns.forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); shape = b.textContent.trim(); renderDims(); compute(); }); });
    function renderDims() {
      var u = unitSel.value, vals = {};
      $$('input', dims).forEach(function (i) { vals[i.name] = i.value; });
      dims.innerHTML = SHAPES[shape].map(function (d) {
        var n = 'd_' + d.replace(/[^a-z]/gi, '').toLowerCase();
        return '<div><label>' + d + ' (' + u + ')</label><input type="number" min="0" step="any" name="' + n + '" value="' + (vals[n] || '') + '" placeholder="Enter ' + d.toLowerCase() + '"></div>';
      }).join('');
      $$('input', dims).forEach(function (i) { i.addEventListener('input', compute); });
    }
    function v(n) { var i = dims.querySelector('[name=d_' + n + ']'); return i ? parseFloat(i.value) : NaN; }
    function compute() {
      var k = UNIT[unitSel.value] || 0.001, d = parseFloat(den.value), q = parseInt(qtyIn.value, 10) || 1, vol = NaN;
      var L = v('length') * k, W = v('width') * k, T = v('thickness') * k, D = v('diameter') * k, OD = v('outerdiameterod') * k, ID = v('innerdiameterid') * k, H = v('height') * k, AF = v('acrossflatswidth') * k;
      if (shape === 'Sheet / Plate') vol = L * W * T;
      else if (shape === 'Round Rod / Bar') vol = Math.PI * Math.pow(D / 2, 2) * L;
      else if (shape === 'Pipe / Tube') vol = Math.PI * (Math.pow(OD / 2, 2) - Math.pow(ID / 2, 2)) * L;
      else if (shape === 'Square Bar') vol = W * H * L;
      else if (shape === 'Hex Bar') vol = (Math.sqrt(3) / 2) * AF * AF * L;
      else if (shape === 'Ring') vol = Math.PI * (Math.pow(OD / 2, 2) - Math.pow(ID / 2, 2)) * T;
      else if (shape === 'Block / Cube') vol = L * W * H;
      if (!(vol > 0) || !(d > 0)) { out.innerHTML = '<p class="empty">Enter dimensions to see calculated weight.</p>'; return; }
      var unitKg = vol * d, total = unitKg * q;
      function fmt(x) { return x >= 1000 ? (x / 1000).toFixed(3) + ' t' : x >= 1 ? x.toFixed(3) + ' kg' : (x * 1000).toFixed(2) + ' g'; }
      out.innerHTML = '<div class="big">' + fmt(total) + '</div><div class="rows">' +
        '<div><span>Material</span><span>' + esc(matSel.options[matSel.selectedIndex].text) + '</span></div>' +
        '<div><span>Shape</span><span>' + esc(shape) + '</span></div>' +
        '<div><span>Density</span><span>' + d + ' kg/m³</span></div>' +
        '<div><span>Volume (per piece)</span><span>' + (vol * 1e6).toFixed(2) + ' cm³</span></div>' +
        '<div><span>Weight (per piece)</span><span>' + fmt(unitKg) + '</span></div>' +
        '<div><span>Quantity</span><span>' + q + '</span></div></div>';
    }
    $('[data-reset]', calc).addEventListener('click', function () { $$('input', dims).forEach(function (i) { i.value = ''; }); qtyIn.value = 1; compute(); });
    renderDims(); compute();
  }
})();

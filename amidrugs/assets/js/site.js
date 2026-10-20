/* Ami Drugs site behaviour: header, dropdowns, mobile menu, review mode, counters, carousel, product catalogue, enquiry form. No dependencies. */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Review mode: add ?review=1 to any URL to highlight facts that still need confirming (remembered for the session) */
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.has("review")) sessionStorage.setItem("amiReview", qs.get("review") === "0" ? "" : "1");
    if (sessionStorage.getItem("amiReview")) root.classList.add("review");
  } catch (e) {}

  /* Header shadow */
  var hdr = d.querySelector(".site-header");
  function onScroll() { if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* Dropdowns: hover/focus via CSS; click toggles for touch, Esc closes */
  d.querySelectorAll(".nav > .item.has-mega > a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var item = a.parentElement;
      if (window.matchMedia("(hover: none)").matches && !item.classList.contains("open")) { e.preventDefault(); d.querySelectorAll(".nav > .item.open").forEach(function (i) { i.classList.remove("open"); }); item.classList.add("open"); }
    });
  });
  d.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    d.querySelectorAll(".nav > .item.open").forEach(function (i) { i.classList.remove("open"); });
    if (d.activeElement && d.activeElement.closest(".mega")) { d.activeElement.closest(".item").querySelector("a").focus(); }
    setMenu(false);
  });
  d.addEventListener("click", function (e) { if (!e.target.closest(".nav")) d.querySelectorAll(".nav > .item.open").forEach(function (i) { i.classList.remove("open"); }); });

  /* Mobile menu */
  var mnav = d.getElementById("mnav"), mbtn = d.querySelector(".menu-btn");
  function setMenu(open) {
    if (!mnav || !mbtn) return;
    var was = mnav.classList.contains("open"); if (was === open) return;
    mnav.classList.toggle("open", open); d.body.classList.toggle("menu-open", open);
    mbtn.setAttribute("aria-expanded", open ? "true" : "false");
    mbtn.querySelector(".i-open").style.display = open ? "none" : "";
    mbtn.querySelector(".i-close").style.display = open ? "" : "none";
  }
  if (mbtn) mbtn.addEventListener("click", function () { setMenu(!mnav.classList.contains("open")); });

  /* Count-up numbers */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduce) { el.textContent = target; return; }
    var t0 = null, dur = 1200;
    function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var nums = d.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); } }); }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* Hero slider: auto-advances when each progress bar fills; pauses on hover/focus, pause button, swipe, arrow keys.
     With reduced motion the CSS animation is off, so slides only change when the visitor chooses. */
  d.querySelectorAll("[data-slider]").forEach(function (hero) {
    var slides = [].slice.call(hero.querySelectorAll(".slide")), dots = [].slice.call(hero.querySelectorAll(".hero-dots button"));
    var pauseBtn = hero.querySelector(".hb.pause"), cur = 0;
    function go(n) {
      n = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === n; s.classList.toggle("is-active", on);
        if (on) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden", "true");
        s.querySelectorAll("a").forEach(function (a) { if (on) a.removeAttribute("tabindex"); else a.setAttribute("tabindex", "-1"); });
      });
      dots.forEach(function (b, i) {
        b.classList.remove("on"); b.classList.toggle("done", i < n);
        if (i === n) { void b.offsetWidth; b.classList.add("on"); b.setAttribute("aria-current", "true"); } else b.removeAttribute("aria-current");
      });
      cur = n;
    }
    dots.forEach(function (b, i) {
      b.addEventListener("click", function () { go(i); });
      b.querySelector("i").addEventListener("animationend", function () { if (i === cur) go(cur + 1); });
    });
    hero.querySelector("[data-hprev]").addEventListener("click", function () { go(cur - 1); });
    hero.querySelector("[data-hnext]").addEventListener("click", function () { go(cur + 1); });
    pauseBtn.addEventListener("click", function () {
      var p = hero.classList.toggle("paused");
      pauseBtn.setAttribute("aria-label", p ? "Play slideshow" : "Pause slideshow");
    });
    hero.addEventListener("mouseenter", function () { hero.classList.add("hold"); });
    hero.addEventListener("mouseleave", function () { hero.classList.remove("hold"); });
    hero.addEventListener("focusin", function () { hero.classList.add("hold"); });
    hero.addEventListener("focusout", function (e) { if (!hero.contains(e.relatedTarget)) hero.classList.remove("hold"); });
    hero.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(cur - 1); if (e.key === "ArrowRight") go(cur + 1); });
    var x0 = null;
    hero.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    d.addEventListener("visibilitychange", function () { hero.classList.toggle("hold", d.hidden); });
  });

  /* Carousel */
  d.querySelectorAll("[data-rail]").forEach(function (wrap) {
    var rail = wrap.querySelector(".rail"), bar = wrap.querySelector(".track i"), prev = wrap.querySelector("[data-prev]"), next = wrap.querySelector("[data-next]");
    function upd() {
      var max = rail.scrollWidth - rail.clientWidth, vis = rail.clientWidth / rail.scrollWidth, p = max > 0 ? rail.scrollLeft / max : 1;
      bar.style.width = Math.min(1, vis + (1 - vis) * p) * 100 + "%";
      prev.disabled = rail.scrollLeft <= 4; next.disabled = rail.scrollLeft >= max - 4;
    }
    function by(dir) { var c = rail.querySelector(".acard"); rail.scrollBy({ left: dir * ((c ? c.offsetWidth : 360) + 24), behavior: reduce ? "auto" : "smooth" }); }
    prev.addEventListener("click", function () { by(-1); }); next.addEventListener("click", function () { by(1); });
    rail.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
  });

  /* Product finder forms -> products page */
  d.querySelectorAll("form[data-finder]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = (f.querySelector("input").value || "").trim();
      location.href = "products.html" + (q ? "?q=" + encodeURIComponent(q) : "") + "#catalogue";
    });
  });

  /* Sub-navigation highlight */
  var sub = [].slice.call(d.querySelectorAll(".subnav a[href^='#']"));
  if (sub.length) {
    var secs = sub.map(function (a) { return d.getElementById(a.getAttribute("href").slice(1)); });
    var hiOn = function () {
      var line = window.innerHeight * 0.35, cur = 0;
      secs.forEach(function (s, i) { if (s && s.offsetParent !== null && s.getBoundingClientRect().top <= line) cur = i; });
      sub.forEach(function (a, i) { a.classList.toggle("on", i === cur); });
    };
    window.addEventListener("scroll", hiOn, { passive: true }); hiOn();
  }

  /* Product catalogue */
  var cat = d.getElementById("catalogue");
  if (cat && window.AMI_PRODUCTS) {
    var P = window.AMI_PRODUCTS, A = window.AMI_AREAS, names = {};
    A.forEach(function (a) { names[a.id] = a.name; });
    var list = cat.querySelector(".plist"), qIn = cat.querySelector("#q"), chips = cat.querySelector("#area-chips"), az = cat.querySelector(".az"), count = cat.querySelector("#count"), reset = cat.querySelector("#reset");
    var ps = new URLSearchParams(location.search);
    var st = { q: ps.get("q") || "", area: ps.get("area") || "", letter: "" };
    qIn.value = st.q;
    function chip(id, label, n) {
      var b = d.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.area = id;
      b.innerHTML = label + " <span class='n'>" + n + "</span>";
      b.addEventListener("click", function () { st.area = st.area === id ? "" : id; render(); });
      return b;
    }
    chips.appendChild(chip("", "All", P.length));
    A.forEach(function (a) { chips.appendChild(chip(a.id, a.name, P.filter(function (p) { return p.a === a.id; }).length)); });
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (L) {
      var b = d.createElement("button"); b.type = "button"; b.textContent = L; b.setAttribute("aria-label", "Molecules starting with " + L);
      if (!P.some(function (p) { return p.n.charAt(0).toUpperCase() === L; })) b.disabled = true;
      b.addEventListener("click", function () { st.letter = st.letter === L ? "" : L; render(); });
      az.appendChild(b);
    });
    qIn.addEventListener("input", function () { st.q = qIn.value; render(); });
    cat.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); });
    reset.addEventListener("click", function () { st = { q: "", area: "", letter: "" }; qIn.value = ""; render(); });
    function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    function render() {
      var q = st.q.trim().toLowerCase();
      var rows = P.filter(function (p) {
        return (!st.area || p.a === st.area) && (!st.letter || p.n.charAt(0).toUpperCase() === st.letter) && (!q || p.n.toLowerCase().indexOf(q) > -1 || names[p.a].toLowerCase().indexOf(q) > -1);
      });
      chips.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.area === st.area ? "true" : "false"); });
      az.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.textContent === st.letter ? "true" : "false"); });
      count.textContent = rows.length + (rows.length === 1 ? " molecule" : " molecules");
      reset.style.visibility = (st.q || st.area || st.letter) ? "visible" : "hidden";
      list.innerHTML = rows.length ? rows.map(function (p) {
        return "<li><span class='nm'>" + esc(p.n) + "</span><span class='ar'>" + esc(names[p.a]) + "</span><a class='enq' href='contact.html?topic=supply&amp;api=" + encodeURIComponent(p.n) + "#enquiry'>Enquire " + arrow + "</a></li>";
      }).join("") : "<li class='empty'>No molecule matches that search. <a href='contact.html?topic=supply#enquiry'>Ask our team</a> about it directly.</li>";
      try { var u = new URL(location.href); ["q", "area"].forEach(function (k) { if (st[k]) u.searchParams.set(k, st[k]); else u.searchParams.delete(k); }); history.replaceState(null, "", u.pathname + u.search + u.hash); } catch (e) {}
    }
    render();
  }

  /* Enquiry form */
  var form = d.getElementById("enquiry-form");
  if (form) {
    var fp = new URLSearchParams(location.search);
    if (fp.get("api")) form.elements.molecule.value = fp.get("api");
    if (fp.get("topic") && form.elements.topic.querySelector("option[value='" + fp.get("topic") + "']")) form.elements.topic.value = fp.get("topic");
    var status = form.querySelector(".status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form), endpoint = form.getAttribute("data-endpoint"), to = form.getAttribute("data-mailto");
      if (endpoint) {
        status.textContent = "Sending…";
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error(r.status); status.textContent = "Thank you. Your enquiry has reached our team."; form.reset(); })
          .catch(function () { status.textContent = "Sorry, that did not go through. Please email " + to + "."; });
        return;
      }
      var lines = []; data.forEach(function (v, k) { if (v && k !== "botcheck") lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ": " + v); });
      var subj = "Website enquiry: " + (data.get("topic") || "general") + (data.get("molecule") ? " (" + data.get("molecule") + ")" : "");
      location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(lines.join("\n"));
      status.textContent = "Your email app should open with the enquiry filled in. If it doesn't, write to " + to + ".";
    });
  }

  var y = d.getElementById("yr"); if (y) y.textContent = new Date().getFullYear();
})();

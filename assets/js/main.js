/* Avenir Solutions — global interactions */
(function () {
  "use strict";

  /* ---------- Sticky header ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  const menu = document.querySelector(".mobile-menu");
  const toggle = document.querySelector(".nav-toggle");
  if (menu && toggle) {
    const close = () => menu.classList.remove("open");
    toggle.addEventListener("click", () => menu.classList.add("open"));
    menu.querySelector(".mobile-backdrop").addEventListener("click", close);
    menu.querySelector(".close-btn").addEventListener("click", close);
  }

  /* ---------- Hero slider ---------- */
  const heroEl = document.querySelector(".hero");
  if (heroEl) {
    const slides = [...heroEl.querySelectorAll(".hero-slide")];
    const dots = [...heroEl.querySelectorAll(".hero-dot")];
    const counter = heroEl.querySelector(".hero-count b");
    let idx = 0, timer = null;
    const go = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("active", i === idx));
      dots.forEach((d, i) => {
        d.classList.remove("active");
        const f = d.querySelector(".fill");
        f.style.animation = "none"; void f.offsetWidth; f.style.animation = "";
        if (i === idx) d.classList.add("active");
      });
      if (counter) counter.textContent = "0" + (idx + 1);
      restart();
    };
    const restart = () => { clearTimeout(timer); timer = setTimeout(() => go(idx + 1), 6500); };
    dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
    go(0);
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io2.unobserve(e.target);
        const el = e.target, target = parseFloat(el.dataset.count), dur = 1800, t0 = performance.now();
        const fmt = (v) => el.dataset.decimals ? v.toFixed(el.dataset.decimals) : Math.round(v).toLocaleString("en-IN");
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => io2.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q"), a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      item.closest(".faq").querySelectorAll(".faq-item.open").forEach((o) => {
        o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- Back to top ---------- */
  const toTop = document.querySelector(".to-top");
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Inquiry list (localStorage) ---------- */
  const KEY = "avenir_inquiry";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));

  const fab = document.querySelector(".inquiry-fab");
  const drawer = document.querySelector(".inquiry-drawer");

  const renderInquiry = () => {
    const items = read();
    if (fab) {
      const c = fab.querySelector(".count");
      if (c) c.textContent = items.length;
    }
    if (!drawer) return;
    const list = drawer.querySelector(".inquiry-list");
    list.innerHTML = items.length
      ? items.map((it, i) => `<div class="inquiry-item"><span>${it}</span><button data-i="${i}" aria-label="Remove">&times;</button></div>`).join("")
      : `<div class="inquiry-empty">Your inquiry list is empty.<br>Add products or services from any page.</div>`;
    list.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => { const v = read(); v.splice(+b.dataset.i, 1); write(v); renderInquiry(); }));
  };

  window.avenirAddInquiry = (label) => {
    const v = read();
    if (!v.includes(label)) { v.push(label); write(v); }
    renderInquiry();
    if (drawer) drawer.classList.add("open");
  };

  document.querySelectorAll("[data-inquiry]").forEach((btn) =>
    btn.addEventListener("click", (ev) => { ev.preventDefault(); window.avenirAddInquiry(btn.dataset.inquiry); }));

  if (fab && drawer) {
    fab.addEventListener("click", () => { renderInquiry(); drawer.classList.add("open"); });
    drawer.querySelector(".backdrop").addEventListener("click", () => drawer.classList.remove("open"));
    drawer.querySelector(".inquiry-close").addEventListener("click", () => drawer.classList.remove("open"));
    drawer.querySelector(".inquiry-send").addEventListener("click", () => {
      const items = read();
      const body = encodeURIComponent(
        "Hello Avenir Solutions,\n\nI would like a quotation for the following:\n\n" +
        (items.length ? items.map((i) => "• " + i).join("\n") : "(please describe your requirement)") +
        "\n\nCompany:\nName:\nPhone:\n\nThank you."
      );
      window.location.href = "mailto:sales@avenirbharat.com?subject=" + encodeURIComponent("Inquiry — Avenir Solutions") + "&body=" + body;
    });
  }
  renderInquiry();

  /* ---------- Contact form (mailto compose) ---------- */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const g = (n) => (form.querySelector(`[name=${n}]`) || {}).value || "";
      const body = encodeURIComponent(
        `Company: ${g("company")}\nName: ${g("name")}\nEmail: ${g("email")}\nPhone: ${g("phone")}\n\nMessage:\n${g("message")}`
      );
      window.location.href = "mailto:info@avenirbharat.com?subject=" +
        encodeURIComponent("Website Inquiry — " + (g("company") || g("name"))) + "&body=" + body;
    });
  }
})();

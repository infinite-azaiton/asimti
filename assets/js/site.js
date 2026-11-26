/* Asimti landing page — language switch, menu, and motion (all motion respects prefers-reduced-motion) */
(function () {
  "use strict";

  var LANGS = ["ar", "en"];
  var lang = "ar";
  var root = document.documentElement;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* ---------- i18n ---------- */
  function apply(dict) {
    $all("[data-i18n]").forEach(function (el) {
      var v = dict[el.getAttribute("data-i18n")];
      if (v !== undefined) el.innerHTML = v;
    });
    if (dict["site.title"]) document.title = dict["site.title"];
  }
  function setLang(next) {
    if (LANGS.indexOf(next) < 0) next = "ar";
    return fetch("assets/i18n/" + next + ".json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (dict) {
        lang = next;
        root.lang = next;
        root.dir = next === "ar" ? "rtl" : "ltr";
        try { localStorage.setItem("asimti.lang", next); } catch (e) { /* ignore */ }
        apply(dict);
      })
      .catch(function (err) { console.error("i18n load failed", err); })
      .then(function () { root.classList.add("ready"); onScroll(); });
  }
  var langBtn = $("#langBtn");
  if (langBtn) langBtn.addEventListener("click", function () { setLang(lang === "ar" ? "en" : "ar"); });

  /* ---------- mobile menu ---------- */
  var header = $(".site-header"), toggle = $("#navToggle"), links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      header.classList.toggle("menu-open", open);
    });
    links.addEventListener("click", function (e) {
      if (!e.target.closest("a")) return;
      links.classList.remove("open"); header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- scroll: header state, progress bar, goals timeline ---------- */
  var bar = $("#progressBar"), goalsWrap = $(".goals-wrap"), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (bar) {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
    if (goalsWrap) {
      var r = goalsWrap.getBoundingClientRect();
      var p = (window.innerHeight * 0.62 - r.top) / r.height;
      goalsWrap.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- active section in the menu ---------- */
  if ("IntersectionObserver" in window && links) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $all(".links a").forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $all("main section[id]").forEach(function (sec) { spy.observe(sec); });
  }

  /* ---------- scroll reveal with stagger ---------- */
  var items = $all(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    root.classList.add("anim");
    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains("reveal"); });
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 90 + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- pointer glow on cards ---------- */
  if (!reduced && window.matchMedia && matchMedia("(hover: hover)").matches) {
    $all(".hi-card, .vm, .value, .who-card, .offer, .goals li, .contact").forEach(function (card) {
      card.classList.add("glow");
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- hero parallax ---------- */
  var hero = $("#hero"), art = $("#heroArt");
  if (hero && art && !reduced && window.matchMedia && matchMedia("(hover: hover)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      art.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      art.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", function () {
      art.style.setProperty("--px", 0); art.style.setProperty("--py", 0);
    });
  }

  /* ---------- the "digital moon": a living disc of binary digits, after the Asimti logo ---------- */
  (function moon() {
    var canvas = $("#moon");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d"), cells = [], size = 0, cell = 15, visible = true, last = 0, t = 0;

    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth;
      if (!size) return;
      canvas.width = canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = size < 340 ? 12 : 15;
      cells = [];
      var R = size / 2, rowH = cell * 1.22;
      for (var y = rowH; y < size; y += rowH) {
        for (var x = cell / 2; x < size; x += cell * 0.82) {
          var dx = x - R, dy = y - R;
          if (dx * dx + dy * dy > (R - 4) * (R - 4)) continue;
          cells.push({ x: x, y: y, c: Math.random() < 0.5 ? "0" : "1", a: 0.25 + Math.random() * 0.75, gap: Math.random() < 0.09 });
        }
      }
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, size, size);
      var g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#bfeaff"); g.addColorStop(0.55, "#2aaae1"); g.addColorStop(1, "#33d98a");
      ctx.fillStyle = g;
      ctx.font = "700 " + Math.round(cell * 0.95) + "px 'Courier New', monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        if (c.gap) continue;
        // a soft band of light sweeping diagonally across the disc
        var wave = 0.5 + 0.5 * Math.sin((c.x + c.y) / 70 - t * 1.6);
        ctx.globalAlpha = Math.min(1, c.a * (0.35 + 0.75 * wave));
        ctx.fillText(c.c, c.x, c.y);
      }
      ctx.globalAlpha = 1;
    }
    function tick(now) {
      if (visible && now - last > 80) {
        last = now; t += 0.08;
        for (var k = 0; k < cells.length * 0.04; k++) {
          var c = cells[(Math.random() * cells.length) | 0];
          c.c = c.c === "0" ? "1" : "0"; c.a = 0.25 + Math.random() * 0.75;
        }
        draw();
      }
      requestAnimationFrame(tick);
    }
    build();
    window.addEventListener("resize", build);
    if (reduced) return;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(canvas);
    }
    requestAnimationFrame(tick);
  })();

  /* ---------- boot ---------- */
  var initial = "ar";
  try {
    initial = new URLSearchParams(location.search).get("lang") || localStorage.getItem("asimti.lang") || "ar";
  } catch (e) { /* ignore */ }
  setLang(initial);
})();

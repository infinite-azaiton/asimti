/* Asimti website — shared behaviour: i18n, header/footer, portal links, services guide, FAQ */
(function () {
  "use strict";

  var CONFIG = window.ASIMTI_CONFIG || {};
  var LANGS = ["ar", "en"];
  var dict = {};
  var lang = "ar";
  var page = document.body.getAttribute("data-page") || "";

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function t(key) { return dict[key] !== undefined ? dict[key] : key; }
  function L(item, field) { return item[field + (lang === "en" ? "En" : "Ar")] || item[lang] || ""; }
  function norm(v) {
    return String(v || "").toLowerCase()
      .replace(/[ً-ٰٟ]/g, "")
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").trim();
  }
  function getJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }

  var ICONS = {
    arrow: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    building: '<path d="M4 21V5l8-2v18M12 9l8 2v10M2 21h20M7 8h2M7 12h2M7 16h2M15 14h2M15 17h2"/>',
    house: '<path d="M3 11 12 3l9 8M5 10v11h14V10M10 21v-6h4v6"/>',
    water: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/>',
    invoice: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2ZM9 7h6M9 11h6M9 15h3"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6.2A8 8 0 1 1 21 12Z"/>',
    landmark: '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-6 10 6Z"/>',
    badge: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M9 3v4M15 3v4M8 15a4 4 0 0 1 8 0"/><circle cx="12" cy="11" r="2"/>',
    shield: '<path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z"/>',
    card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
    file: '<path d="M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6"/>'
  };
  function icon(name, size) {
    size = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }
  var SOCIAL_ICONS = {
    facebook: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 12 2Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800ZM10 15V9l5.200 3L10 15Z"/></svg>'
  };

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3200);
  }

  /* ---------- header / footer ---------- */
  var NAV = [
    ["home", "index.html", "nav.home"],
    ["services", "services.html", "nav.services"],
    ["about", "about.html", "nav.about"],
    ["faq", "faq.html", "nav.faq"],
    ["contact", "contact.html", "nav.contact"]
  ];
  function socialHtml(always) {
    var s = CONFIG.social || {};
    var keys = always ? ["x", "instagram", "facebook"] : Object.keys(SOCIAL_ICONS).filter(function (k) { return s[k]; });
    return keys.map(function (k) {
      if (s[k]) return '<a href="' + esc(s[k]) + '" target="_blank" rel="noopener" aria-label="' + k + '">' + SOCIAL_ICONS[k] + "</a>";
      return '<a href="#" data-soon aria-label="' + k + '">' + SOCIAL_ICONS[k] + "</a>";
    }).join("");
  }
  function storesHtml() {
    return '<div class="stores">' +
      '<a class="store" data-store="googlePlayUrl" href="#"><span class="store-ic" aria-hidden="true">▶</span><span><small>GET IT ON</small><b>Google Play</b></span></a>' +
      '<a class="store" data-store="appStoreUrl" href="#"><span class="store-ic" aria-hidden="true"></span><span><small>Download on the</small><b>App Store</b></span></a>' +
      "</div>";
  }
  function renderChrome() {
    var header = $("#site-header"), footer = $("#site-footer");
    if (header) {
      header.innerHTML =
        '<div class="topline"><div class="container"><span data-i18n="top.tagline"></span><div class="social">' + socialHtml() + "</div></div></div>" +
        '<header class="site-header"><div class="container nav">' +
        '<a class="brand" href="index.html"><img src="assets/img/logo.png" alt="" width="62" height="67"><span class="sr-only" data-i18n="brand"></span></a>' +
        '<nav class="links" id="navLinks" aria-label="Main">' +
        NAV.map(function (n) {
          return '<a href="' + n[1] + '"' + (n[0] === page ? ' class="active" aria-current="page"' : "") + ' data-i18n="' + n[2] + '"></a>';
        }).join("") + "</nav>" +
        '<div class="tools">' +
        '<button class="icon-btn lang-btn" id="langBtn" type="button">' + icon("globe") + '<span data-i18n="lang.switch"></span></button>' +
        '<a class="btn btn-outline" data-portal href="#">' + icon("user", 18) + '<span data-i18n="cta.signin"></span></a>' +
        '<button class="icon-btn nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navLinks">' + icon("menu", 24) + '<span class="sr-only" data-i18n="nav.menu"></span></button>' +
        "</div></div></header>";
    }
    if (footer) {
      footer.innerHTML =
        '<section class="contact-strip"><div class="container"><div><h2 data-i18n="strip.title"></h2><p data-i18n="strip.text"></p></div>' +
        '<a class="phone-pill" href="tel:' + esc(CONFIG.phone || "") + '">' + icon("phone", 34) + '<b dir="ltr">' + esc(CONFIG.phone || "") + "</b></a></div></section>" +
        '<footer class="site-footer"><div class="container"><div class="footer-main">' +
        '<div class="footer-app"><img src="assets/img/logo-white.png" alt="" width="145" height="157"><div><h3 data-i18n="footer.app.title"></h3><p data-i18n="footer.app.text"></p>' + storesHtml() + "</div></div>" +
        '<div class="footer-links"><small data-i18n="footer.links"></small>' +
        ["privacy", "terms", "sla", "disclaimer", "security", "sitemap"].map(function (k) {
          return '<a href="#" data-soon data-i18n="footer.' + k + '"></a>';
        }).join("") + "</div>" +
        '<div class="footer-links"><small data-i18n="footer.portal"></small>' +
        '<a href="services.html" data-i18n="cta.catalogue"></a>' +
        '<a href="#" data-portal data-i18n="footer.reg.individual"></a>' +
        '<a href="#" data-portal data-i18n="footer.reg.company"></a>' +
        '<a href="#" data-portal data-i18n="footer.reg.track"></a>' +
        '<a href="faq.html" data-i18n="footer.faq"></a></div>' +
        "</div>" +
        '<div class="footer-bottom"><span data-i18n="footer.rights"></span><div class="social">' + socialHtml(true) + "</div></div>" +
        "</div></footer>";
    }
    var langBtn = $("#langBtn");
    if (langBtn) langBtn.addEventListener("click", function () { setLang(lang === "ar" ? "en" : "ar"); });
    var toggle = $("#navToggle");
    if (toggle) toggle.addEventListener("click", function () {
      var open = $("#navLinks").classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- portal / store links ---------- */
  function wireLinks() {
    $all("[data-portal]").forEach(function (a) {
      if (CONFIG.portalUrl) a.href = CONFIG.portalUrl;
    });
    $all("[data-store]").forEach(function (a) {
      var url = CONFIG[a.getAttribute("data-store")];
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    });
  }
  // Links without a configured destination show a "coming soon" notice instead of navigating.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-portal],[data-store],[data-soon]");
    if (!a) return;
    var key = "soon.page", url = "";
    if (a.hasAttribute("data-store")) { key = "soon.app"; url = CONFIG[a.getAttribute("data-store")]; }
    else if (a.hasAttribute("data-portal")) { key = "soon.portal"; url = CONFIG.portalUrl; }
    if (url) return;
    e.preventDefault();
    toast(t(key));
  });

  /* ---------- i18n ---------- */
  function applyI18n(root) {
    $all("[data-i18n]", root).forEach(function (el) {
      var v = dict[el.getAttribute("data-i18n")];
      if (v !== undefined) el.innerHTML = v;
    });
    $all("[data-i18n-attr]", root).forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":");
        if (p.length === 2 && dict[p[1]] !== undefined) el.setAttribute(p[0].trim(), dict[p[1].trim()]);
      });
    });
    var titleKey = document.body.getAttribute("data-title");
    document.title = (titleKey ? t(titleKey) + " | " : "") + t("site.title");
  }
  function setLang(next, initial) {
    if (LANGS.indexOf(next) < 0) next = "ar";
    return getJSON("assets/i18n/" + next + ".json").then(function (d) {
      dict = d; lang = next;
      document.documentElement.lang = next;
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      try { localStorage.setItem("asimti.lang", next); } catch (e) { /* ignore */ }
      applyI18n(document);
      document.documentElement.classList.add("ready");
      document.dispatchEvent(new CustomEvent("asimti:lang", { detail: { lang: next, initial: !!initial } }));
    }).catch(function (err) { document.documentElement.classList.add("ready"); console.error("i18n load failed", err); });
  }

  /* ---------- sectors (services are not live yet: informative "coming soon" cards) ---------- */
  function initSectors() {
    var grid = $("#svcGrid"), home = $("#homeSectors");
    if (!grid && !home) return;
    var data = null;
    function card(s, compact) {
      var planned = (!compact && s.planned && s.planned.length)
        ? '<div class="svc-planned"><small>' + esc(t("svc.planned")) + "</small><ul>" +
          s.planned.map(function (p) { return "<li>" + esc(L(p, "name")) + "</li>"; }).join("") + "</ul></div>"
        : "";
      return '<article class="' + (compact ? "sector-card" : "svc-card") + '" style="--accent:' + s.color + ";--tint:" + s.tint + '">' +
        '<span class="soon-badge">' + esc(t("svc.badge")) + "</span>" +
        "<h3><i>" + icon(s.icon, 22) + "</i>" + esc(L(s, "name")) + "</h3>" +
        "<p>" + esc(L(s, "desc")) + "</p>" + planned +
        (compact ? '<a class="btn btn-light" href="services.html">' + esc(t("cta.more")) + icon("arrow", 16) + "</a>" : "") +
        "</article>";
    }
    function render() {
      if (!data) return;
      if (grid) grid.innerHTML = data.sectors.map(function (s) { return card(s, false); }).join("");
      if (home) home.innerHTML = data.sectors.filter(function (s) { return s.featured; }).map(function (s) { return card(s, true); }).join("");
    }
    document.addEventListener("asimti:lang", render);
    getJSON("assets/data/services.json").then(function (d) { data = d; render(); });
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    var box = $("#faqList");
    if (!box) return;
    var data = null, cat = "all", q = "", open = null;
    var CAT_ICONS = { account: "user", services: "file", enquiries: "search", payment: "card", tracking: "chat", security: "shield" };

    function match(r) {
      var k = norm(q);
      return !k || norm(L(r, "q")).indexOf(k) >= 0 || norm(L(r, "a")).indexOf(k) >= 0;
    }
    function render() {
      if (!data) return;
      var rows = data.items.map(function (r, i) { r.i = i; return r; });
      $("#faqCats").innerHTML = [{ key: "all" }].concat(data.categories).map(function (c) {
        var n = rows.filter(function (r) { return (c.key === "all" || r.cat === c.key) && match(r); }).length;
        var label = c.key === "all" ? t("faq.all") : L(c, "name");
        return '<button type="button" aria-pressed="' + (cat === c.key) + '" data-cat="' + c.key + '">' + esc(label) + "<span>" + n + "</span></button>";
      }).join("");
      var list = rows.filter(function (r) { return (cat === "all" || r.cat === cat) && match(r); });
      if (!list.length) { box.innerHTML = '<div class="empty">' + esc(t("faq.empty")) + "</div>"; return; }
      box.innerHTML = data.categories.filter(function (c) {
        return list.some(function (r) { return r.cat === c.key; });
      }).map(function (c) {
        return '<section class="faq-group"><h2><i>' + icon(CAT_ICONS[c.key] || "file", 18) + "</i>" + esc(L(c, "name")) + "</h2>" +
          list.filter(function (r) { return r.cat === c.key; }).map(function (r) {
            var isOpen = open === r.i;
            return '<div class="faq-item' + (isOpen ? " open" : "") + '"><button type="button" class="faq-q" aria-expanded="' + isOpen + '" data-i="' + r.i + '"><span>' + esc(L(r, "q")) + '</span><span class="pm">' + icon("plus", 18) + "</span></button>" +
              '<div class="faq-a"><div><p>' + esc(L(r, "a")) + "</p></div></div></div>";
          }).join("") + "</section>";
      }).join("");
    }
    $("#faqCats").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cat]");
      if (b) { cat = b.getAttribute("data-cat"); open = null; render(); }
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".faq-q");
      if (!b) return;
      var i = Number(b.getAttribute("data-i"));
      open = open === i ? null : i;
      $all(".faq-item", box).forEach(function (el) {
        var btn = $(".faq-q", el), on = Number(btn.getAttribute("data-i")) === open;
        el.classList.toggle("open", on);
        btn.setAttribute("aria-expanded", String(on));
      });
    });
    $("#faqSearch").addEventListener("input", function (e) { q = e.target.value; open = null; render(); });
    document.addEventListener("asimti:lang", render);
    getJSON("assets/data/faq.json").then(function (d) { data = d; render(); });
  }

  /* ---------- boot ---------- */
  renderChrome();
  wireLinks();
  initSectors();
  initFaq();

  var initial = "ar";
  try {
    var qs = new URLSearchParams(location.search).get("lang");
    initial = qs || localStorage.getItem("asimti.lang") || "ar";
  } catch (e) { /* ignore */ }
  setLang(initial, true);
})();

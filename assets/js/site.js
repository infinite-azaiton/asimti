/* Asimti landing page — language switch, mobile menu, scroll reveal */
(function () {
  "use strict";

  var LANGS = ["ar", "en"];
  var lang = "ar";
  var root = document.documentElement;

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
      .then(function () { root.classList.add("ready"); });
  }

  var langBtn = $("#langBtn");
  if (langBtn) langBtn.addEventListener("click", function () { setLang(lang === "ar" ? "en" : "ar"); });

  /* ---------- mobile menu ---------- */
  var toggle = $("#navToggle"), links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      toggle.setAttribute("aria-expanded", String(links.classList.toggle("open")));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- decorative binary digits in the hero (echoes the logo) ---------- */
  var bits = $(".hero-bits");
  if (bits) {
    var out = "", seed = 7;
    for (var i = 0; i < 2600; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      out += (seed >> 16) & 1;
      if (seed % 11 === 0) out += " ";
    }
    bits.textContent = out;
  }

  /* ---------- scroll reveal ---------- */
  var items = $all(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("anim");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- boot ---------- */
  var initial = "ar";
  try {
    initial = new URLSearchParams(location.search).get("lang") || localStorage.getItem("asimti.lang") || "ar";
  } catch (e) { /* ignore */ }
  setLang(initial);
})();

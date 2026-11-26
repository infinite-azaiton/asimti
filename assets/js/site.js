/* Asimti landing page — language switch, mobile menu, active menu item, gentle reveal */
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
      .then(function () { root.classList.add("ready"); });
  }
  $all("[data-lang-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(lang === "ar" ? "en" : "ar"); });
  });

  /* ---------- mobile menu ---------- */
  var header = $(".site-header"), toggle = $("#navToggle"), links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      toggle.setAttribute("aria-expanded", String(links.classList.toggle("open")));
    });
    links.addEventListener("click", function (e) {
      if (!e.target.closest("a")) return;
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- header shadow once the page is scrolled ---------- */
  if (header) {
    var setShadow = function () { header.classList.toggle("scrolled", (window.scrollY || 0) > 8); };
    window.addEventListener("scroll", setShadow, { passive: true });
    setShadow();
  }

  if ("IntersectionObserver" in window) {
    /* ---------- active section in the menu ---------- */
    if (links) {
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

    /* ---------- gentle reveal on scroll ---------- */
    if (!reduced) {
      root.classList.add("anim");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -6% 0px" });
      $all(".reveal").forEach(function (el) {
        var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains("reveal"); });
        el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 70 + "ms";
        io.observe(el);
      });
    }
  }

  /* ---------- boot ---------- */
  var initial = "ar";
  try {
    initial = new URLSearchParams(location.search).get("lang") || localStorage.getItem("asimti.lang") || "ar";
  } catch (e) { /* ignore */ }
  setLang(initial);
})();

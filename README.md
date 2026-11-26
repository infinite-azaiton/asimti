# Asimti (عاصمتي)

Informative one-page website for **asimti.iq** — the unified digital platform of the Mayoralty of Baghdad. Hosted on GitHub Pages.

Static HTML/CSS/JS, no build step. Push to `main` to deploy.

| Path | Purpose |
|---|---|
| `index.html` | The page (text is filled in from the translation files) |
| `assets/i18n/ar.json`, `assets/i18n/en.json` | All page text, Arabic and English |
| `assets/css/style.css` | Styles (brand colours, Tajawal font, RTL/LTR) |
| `assets/js/site.js` | Language switch, mobile menu, scroll animation |
| `assets/img/` | Logos and images |

Local preview: `python -m http.server 8765`, then open http://localhost:8765.

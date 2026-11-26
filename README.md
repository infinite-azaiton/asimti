# Asimti (عاصمتي)

Public website for **asimti.iq** — the unified digital platform of the Mayoralty of Baghdad. Hosted on GitHub Pages.

Static HTML/CSS/JS, no build step. Push to `main` to deploy.

## Structure

| Path | Purpose |
|---|---|
| `index.html`, `about.html`, `services.html`, `faq.html`, `contact.html`, `404.html` | Pages (text is filled in from the translation files) |
| `assets/i18n/ar.json`, `assets/i18n/en.json` | All page text, Arabic and English |
| `assets/data/services.json` | Service sectors shown in the services guide (currently "coming soon") |
| `assets/data/faq.json` | FAQ categories, questions and answers |
| `assets/js/config.js` | Portal URL, app store links, phone number, social links |
| `assets/js/site.js` | Header/footer, language switch, sectors, FAQ |
| `assets/css/style.css` | Styles (brand colours, Tajawal font, RTL/LTR) |

## Going live with services

Set `portalUrl`, `googlePlayUrl`, `appStoreUrl` and the social links in `assets/js/config.js`. While a value is empty, its button shows a "coming soon" notice.

## Local preview

```
python -m http.server 8765
```

Then open http://localhost:8765.

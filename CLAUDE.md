# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bilingual (Greek/English) static website for **Δίκτυο Κ (Diktyo K)**, a Greek non-profit connecting people from Koufalia, Thessaloniki globally. Hosted on Netlify at `diktyok.netlify.app`.

## Tech Stack

- Plain HTML / CSS / JavaScript — no build step, no frameworks
- Netlify for hosting (git-based deploys, publish dir: `.`)
- Google Fonts: Manrope (used for both `--font-display` and `--font-body`)
- globe.gl library for 3D interactive globe with WebGL
- Netlify Forms for contact form submission

## Architecture

### Bilingual System
Content is toggled via CSS, not routing. Both languages live in the same HTML using `data-lang="gr"` and `data-lang="en"` spans. The body class `lang-en` controls visibility. Language preference is persisted in `localStorage` under key `diktyok-lang`.

### File Structure
- `index.html` — Single-page app with all sections (nav, hero, about, members, scholarships, mentoring, events, news, FAQ, contact, footer)
- `css/style.css` — All styles; uses CSS custom properties (`:root` variables) for theming
- `js/main.js` — All JS: language toggle, mobile nav, scroll effects (IntersectionObserver), FAQ accordion, tabs, contact form, 3D globe
- `assets/` — Logo, seal image, bylaws PDF
- `netlify.toml` — Netlify config with SPA redirect rule

### CSS Design System
Colors are defined as custom properties in `:root`. Primary palette: blue (`#6B90C7`), accent gold (`#C4956A`), dark navy (`#1B2A4A`). The design follows a "Mediterranean Editorial" aesthetic.

### 3D Globe (globe.gl)
Located in `js/main.js` (bottom ~80 lines). Uses `globe.gl` loaded via CDN. Shows member locations as colored dots with animated arcs from Koufalia to 14 cities worldwide. Key settings: `showAtmosphere(false)` (required — enabling it causes flickering on deployed site), auto-rotate paused when off-screen via IntersectionObserver.

### Contact Form
Uses Netlify Forms (`data-netlify="true"`) with honeypot field (`bot-field`) for spam protection. Submissions go to `diktyok@gmail.com`.

## Development

No build commands needed. Open `index.html` directly in a browser or use any local server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

## Deployment

Git-based Netlify deployment. Push to the connected branch triggers auto-deploy. No build command configured — Netlify serves static files directly.

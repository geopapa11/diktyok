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
- `js/main.js` — All JS: language toggle, mobile nav, scroll effects (IntersectionObserver), FAQ accordion, tabs, contact form, 3D globe, events loading (see Events Data System below)
- `assets/` — Logo, seal image, bylaws PDF, events data (`assets/events/`)
- `netlify.toml` — Netlify config with SPA redirect rule

### CSS Design System
Colors are defined as custom properties in `:root`. Primary palette: blue (`#6B90C7`), accent gold (`#C4956A`), dark navy (`#1B2A4A`). The design follows a "Mediterranean Editorial" aesthetic.

### 3D Globe (globe.gl)
Located in `js/main.js` (bottom ~80 lines). Uses `globe.gl` loaded via CDN. Shows member locations as colored dots with animated arcs from Koufalia to 14 cities worldwide. Key settings: `showAtmosphere(false)` (required — enabling it causes flickering on deployed site), auto-rotate paused when off-screen via IntersectionObserver.

### Events Data System
Events are **not** hardcoded in `index.html`. Each event lives in its own folder under `assets/events/{year}/{event-id}/`, and event content is loaded dynamically via `fetch()` in `js/main.js`.

**Folder structure:**
```
assets/events/
├── index.json                          ← list of all event folder paths
├── 2025/
│   └── 2025-12-30-holiday-mixer/
│       ├── event.json                  ← title, date, thumb path, gallery paths
│       ├── description.html            ← event description as raw HTML
│       ├── gallery/                    ← full-size photos
│       └── thumb/                      ← single thumbnail image
└── 2026/
    ├── 2026-04-03-career-day/
    │   └── ... (same structure)
    └── 2026-05-16-annual-assembly/
        ├── event.json
        └── description.html            ← gallery/thumb optional (no photos yet)
```

**Key points:**
- `assets/events/index.json` — flat array of relative paths (e.g. `"2026/2026-04-03-career-day"`) for every event. Must be updated manually whenever an event folder is added or removed.
- `event.json` — structured metadata per event: `id`, `title`, `date` (ISO `YYYY-MM-DD`), `year`, `thumb` (path relative to the event folder), `descriptionFile` (usually `"description.html"`), `gallery` (array of paths relative to the event folder). `gallery` and `thumb` are optional — an event folder may exist with only `event.json` + `description.html` if no photos have been added yet (see `2026-05-16-annual-assembly`).
- `description.html` — the event's description as an HTML snippet (paragraphs, `<strong>`, `<em>`, etc.), injected via `innerHTML`. Safe since content is authored only by the team, not public input.
- JS in `js/main.js` fetches `index.json`, then each event's `event.json` and `description.html`, assembles event objects, sorts by `date` (descending), and splits into upcoming/past for rendering.
- **Local dev caveat:** `fetch()` on these local JSON/HTML files fails under `file://` (CORS). Use a local server (see Development section below) when testing events locally.
- **Adding a new event:** create the folder, add `event.json` + `description.html` (+ `gallery/`/`thumb/` if photos are ready), then add its path to `assets/events/index.json`.
### Contact Form
Uses Netlify Forms (`data-netlify="true"`) with honeypot field (`bot-field`) for spam protection. Submissions go to `diktyok@gmail.com`.

## Development

No build commands needed. Open `index.html` directly in a browser or use any local server:

```bash
python3 -m http.server 8000
# or
npx serve .
```
Note: a local server is **required** (not just recommended) for the Events Data System to work, since it relies on `fetch()` calls that are blocked under `file://`.

## Deployment

Git-based Netlify deployment. Push to the connected branch triggers auto-deploy. No build command configured — Netlify serves static files directly.

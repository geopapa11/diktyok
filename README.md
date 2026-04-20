# Δίκτυο Κ — diktyok.gr

Bilingual (Greek/English) website for **Δίκτυο Κ (Diktyo K)**, a non-profit organization connecting people from Koufalia, Thessaloniki with the global diaspora.

🌐 **Live site**: [diktyok.gr](https://diktyok.gr)

## About Diktyo K

Diktyo K brings together people who share roots in Koufalia, regardless of where they live today. Our mission is to maintain bonds, support the next generation through scholarships and mentoring, and build bridges of knowledge and collaboration.

## Tech Stack

- Plain HTML / CSS / JavaScript — no frameworks, no build step
- [Netlify](https://www.netlify.com/) for hosting (git-based auto-deploys)
- [Google Fonts](https://fonts.google.com/) — Manrope
- [globe.gl](https://globe.gl/) — 3D interactive globe with WebGL
- Netlify Forms for contact form submission

## Development

No build commands needed. Open `index.html` directly in a browser or use any local server:

```bash
python3 -m http.server 8080
```

## Bilingual System

Both Greek and English content live in the same HTML using `data-lang="gr"` and `data-lang="en"` spans. The body class `lang-en` toggles visibility via CSS. Language preference is saved in `localStorage`.

## Deployment

Connected to GitHub via Netlify. Push to `main` triggers auto-deploy.

## License

All rights reserved — Δίκτυο Κ.

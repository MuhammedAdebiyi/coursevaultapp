# CourseVault

AI-powered study platform landing page. Turns your PDFs into quizzes, flashcards, summaries, and mind maps.

**Live site:** [coursevaultai.app](https://coursevaultai.app)

## What's Included

- `index.html` — Main landing page with Three.js 3D globe, countdown timer, and waitlist CTA
- `settings.html` — Admin panel to update the countdown launch date
- `styles.css` — All page styles
- `main.js` — Countdown logic, tile generation, and Three.js globe initialization

## Local Development

No build step required. Open `index.html` in a browser or run a local server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

## Countdown Configuration

The countdown date is managed via `settings.html`. It stores the launch date in `localStorage` under the key `cv_launch_target`. The homepage reads this on load and falls back to **October 20, 2026** if nothing is set.

> **Note:** localStorage is per-browser. The date only updates for the browser where it was set. For a shared countdown, serve the date from a backend API.

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Three.js r128 (3D globe via CDN with SRI)
- Google Fonts (Bricolage Grotesque, DM Sans, Orbitron)

## License

Private — CourseVault 2026

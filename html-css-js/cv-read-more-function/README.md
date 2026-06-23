# Mirza Hadi — CV / Developer Portfolio

A single-page, responsive CV built with plain **HTML, CSS, and JavaScript** — no frameworks, no build step. Designed to be hosted directly on GitHub Pages, reused as a template for future projects, or dropped into any static hosting.

## Live structure

```
/
├── index.html   → all CV content & markup
├── style.css    → all styling (one shared stylesheet)
├── script.js    → all interactivity (one shared script)
└── README.md    → this file
```

## Design concept

The visual direction is a **"Dark IDE" theme** — built to look like a code editor / terminal, since the subject of the CV (a full-stack WordPress developer & technical problem solver) lives in that world every day.

- **Top status bar** — mimics a code editor's title bar (red/yellow/green window dots), with a live "status" message on the right.
- **Terminal block in the hero** — the headline tagline is presented as a `$ whoami` command output, reinforcing the developer identity from the very first thing the visitor sees.
- **Section headers as code comments** — every section title is prefixed with `//`, the way a developer would comment a block of code.
- **Monospace font (JetBrains Mono)** for headings, labels, and dates — paired with a clean sans-serif (Source Sans 3) for body text, so long paragraphs stay easy to read while headings keep the "code" identity.
- **Terminal green (`#7ee787`) and amber (`#d29922`)** accent colors — a nod to classic dark terminal color schemes (think VS Code's default dark theme).

## Read More pattern

Every long section (Professional Summary, Core Skills, Plugin Development, Work Experience, Certifications) uses the same collapsible "Read More" pattern, built once and reused everywhere:

- **HTML:** wrap content into `.readmore-block > .readmore-content` (the hidden part) + a `.readmore-btn` button. No unique IDs required.
- **CSS:** `.readmore-content` is collapsed using `max-height: 0; overflow: hidden;` and expands via a `.active` class with a smooth `transition`.
- **JS:** one shared script (`script.js`) loops through **every** `.readmore-block` on the page using `querySelectorAll`, and finds each block's own button/content pair using `closest()`/`querySelector()` — so you can add unlimited read-more sections without writing new code each time.

This is the same reusable pattern from the mithai shop website project, applied here with the dark IDE styling.

## Accessibility & quality

- Keyboard-visible focus states on all links and buttons (`:focus-visible`).
- `aria-expanded` attribute kept in sync on every Read More button for screen readers.
- `prefers-reduced-motion` respected — animations are disabled for users who request reduced motion at the OS level.
- Fully responsive: skills grid, job headers, and info cards reflow to single columns on mobile.

## How to reuse this template for another project

1. Replace the content inside `index.html` (name, summary, skills, jobs, etc.) with the new person's/brand's details.
2. Adjust the color variables at the top of `style.css` (the `:root` block) to match a new brand palette — every color in the page pulls from those variables, so a brand re-skin only touches one place.
3. If a new section needs the Read More toggle, just copy the `.readmore-block` markup pattern (see Professional Summary section in `index.html`) — `script.js` will automatically pick it up, no extra JS needed.

## Hosting on GitHub

This is ready to push to a GitHub repo and enable via **GitHub Pages** (Settings → Pages → deploy from `main` branch, root folder) to get a live portfolio link instantly — no build tools, no dependencies beyond the Google Fonts CDN link in `index.html`.

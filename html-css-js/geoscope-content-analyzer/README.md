# GEOscope Content Analyzer

A free, simple, static web app for real-time content analysis — combining **Traditional SEO** checks (Yoast-style), **AI SEO / GEO** (Generative Engine Optimization) checks, and a **Word Count** tool, all in one page.

No backend, no database, no build step, no tracking. Just open `index.html` in a browser, or host it on GitHub Pages.

## Features

### 🟢 Traditional SEO tab
Yoast-style real-time checks based on a focus keyword:
- Keyword in title / meta description / URL slug / first paragraph
- Keyword density
- Title & meta description length
- Keyword in subheadings (H2/H3)
- Paragraph & sentence length
- Passive voice usage (heuristic)
- Transition word usage
- Flesch Reading Ease score

### 🤖 AI SEO / GEO tab
Heuristic checks aimed at making content easier for AI engines (AI Overviews, ChatGPT, Perplexity, etc.) to extract and cite:
- Direct-answer / definition sentence near the top
- Question-style subheadings
- Presence of lists/tables (structured, extractable content)
- Numeric/statistical specificity
- Source/citation links
- Summary / TL;DR block
- Freshness signal (date/year mentioned)
- Answer completeness per heading

> These are best-effort heuristics, not a guarantee of ranking or citation by any specific AI engine.

### 🔢 Word Count tab
- Word, character, sentence, and paragraph counts
- Average words per sentence
- Reading time & speaking time estimates
- Top repeated keyword phrases (density table)

### Other features
- Live Google search snippet preview with character-limit truncation
- Auto-saves your draft to `localStorage` (nothing leaves your browser)
- Dark mode (remembers your preference)
- Export your analysis as a copyable or downloadable text report
- Fully responsive (mobile-friendly)

## Usage

1. Clone or download this repo.
2. Open `index.html` directly in your browser — no server or build step required.
3. (Optional) Host it for free via **GitHub Pages**:
   - Push this repo to GitHub
   - Go to **Settings → Pages**
   - Set source to your main branch, root folder
   - Your app will be live at `https://<username>.github.io/<repo-name>/`

## Project structure

```
content-analyzer/
├── index.html          # Main app shell, tabs, shared inputs
├── style.css           # All styling, including dark mode
├── js/
│   ├── main.js          # Tab switching, shared state, snippet preview, theme, persistence
│   ├── textUtils.js      # Shared text parsing helpers (words/sentences/paragraphs/headings)
│   ├── readability.js    # Flesch score, passive voice, transition word detection
│   ├── seoChecks.js       # Traditional SEO tab logic
│   ├── geoChecks.js       # AI SEO / GEO tab logic
│   ├── wordCount.js       # Word Count tab logic
│   └── export.js          # Report copy/download
└── README.md
```

## Limitations

- Passive voice and answer-completeness checks are heuristic-based (regex/pattern matching), not true NLP — they're good guidance, not perfect grammar analysis.
- AI/GEO checks reflect known best practices for generative engine optimization, but no tool can guarantee how a specific AI engine will treat your content.
- Headings are detected via Markdown syntax (`##`, `###`) in the content textarea — if you paste raw HTML, only `<a href>` and `<table>` are specifically parsed for the GEO checks.

## License

Free to use, modify, and self-host. Add your preferred license (e.g. MIT) here.

## Roadmap ideas (future)

- Compare against a competitor's URL/text
- Save multiple drafts/projects locally
- Structured data (schema.org) detection from pasted HTML
- Browser extension version

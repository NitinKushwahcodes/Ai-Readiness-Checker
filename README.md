# AI Readiness Audit

A lightweight diagnostic tool that analyses any website URL for AI discoverability — how well language models, AI-powered search engines, and retrieval systems can read and surface the site's content.

**Live demo:** [your-vercel-url-here]

---

## What It Does

Enter a URL → get an AI Readiness Score (out of 100) + 5 specific structural issues that are limiting the site's visibility in AI-powered search and retrieval systems.

The score is deterministic — the same URL always returns the same score. This is intentional: a random score would be a toy. A reproducible score behaves like a real diagnostic signal.

---

## Folder Structure

```
ai-readiness-audit/
├── index.html        # markup only — no inline styles or scripts
├── css/
│   └── style.css     # all styling, design tokens, responsive rules
├── js/
│   └── audit.js      # scoring logic, issue pool, DOM rendering
└── README.md
```

Separation of concerns even for a vanilla project — HTML handles structure, CSS handles presentation, JS handles behaviour.

---

## How to Run Locally

No build step. No dependencies. Just open it.

```bash
git clone https://github.com/your-username/ai-readiness-audit
cd ai-readiness-audit
open index.html   # or drag into any browser
```

---

## How to Deploy (Vercel)

```bash
npm i -g vercel
vercel
# follow the prompts — done in 60 seconds
```

Or: go to vercel.com → New Project → Import Git Repository → select this repo → Deploy.

---

## Design Decisions

- **Vanilla HTML/CSS/JS** — no framework overhead for a single-page tool. Keeps it fast, readable, and easy to audit.
- **Deterministic scoring** — djb2 hash of the URL maps to a score in the 34–76 range. Never perfect, never broken — realistic audit territory.
- **Issue pool shuffle** — the same hash that produces the score also seeds a Fisher-Yates shuffle of the issue pool, so each URL gets a consistent but varied set of issues.
- **IBM Plex Mono + Newsreader** — monospace for the technical/diagnostic feel, serif for headings to avoid the generic sans-serif AI tool aesthetic.
- **CSS custom properties** — all colour and typography decisions live in `:root`, making theming straightforward.

---

## Author

Nitin Kushwah — BSc(Honors) IIT Guwahati

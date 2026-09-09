# CEE 2083 — Questions & Solutions

A static, no-build study website created from the supplied CEE 2083 exam paper and the supplied hints/solutions PDF.

## Run it

### Simplest
Double-click `index.html` and open it in a modern browser.

### Recommended local server
If your browser blocks local assets, run a small static server from this folder:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Features

- 200-question library
- Physics, Chemistry, Zoology, Botany and MAT filters
- Supplied answers and explanations
- Search with Ctrl+K / Cmd+K
- Question index and random question
- Practice mode
- Reviewed / needs-review state saved in localStorage
- Dark mode
- Original visual references for MAT questions 196–200
- Source PDFs included in `assets/`

## Source fidelity

The content is derived from the two supplied PDFs. Questions whose solution entry is blank or unavailable are deliberately shown as unresolved. The site does not silently invent missing answers.

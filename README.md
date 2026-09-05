# Adritian (Astro)

A fast, accessible Astro theme for personal websites and portfolios — with a
multilingual blog, project/experience showcase, and full RTL support.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

- 🌍 **14 languages out of the box** (English, Spanish, French, German, Dutch,
  Danish, Italian, Portuguese, Swedish, Norwegian, Polish, Korean, Arabic,
  Hebrew) with full **RTL support** for Arabic and Hebrew
- 🎨 **Dark / light / auto color schemes**, toggled client-side and persisted
  to `localStorage`, with an inline anti-flash script so the right theme
  applies before first paint
- 📝 **Blog** with sidebar layout, sticky table of contents, related posts,
  and in-browser search
- 🔎 **SEO built in**: JSON-LD structured data, `hreflang` alternates for
  every translated page, an auto-generated sitemap, and an RSS feed
- 🖼️ **Bootstrap 5** for layout and components
- ♿ **Accessible by default**: skip-to-content link, semantic landmarks, and
  lazy-loaded, responsively-processed images via `astro:assets`

## Quickstart

```bash
git clone https://github.com/zetxek/adritian-astro.git
cd adritian-astro
npm install
npm run dev      # http://localhost:4321
```

Build the static site:

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

## Configuration

- **`src/config/site.ts`** — typed site-wide config: title, author, social
  links, navigation, homepage section toggles, and per-feature settings
  (contact form, newsletter, sharing, comments, SEO). This is the Astro
  equivalent of Hugo's `[params]` block.
- **`src/content/<collection>/<locale>/`** — content collections (experience,
  skills, education, testimonials, clients, projects, blog, showcase), split
  into per-locale folders. Missing translations automatically fall back to
  the English content.
- **`src/i18n/*.yaml`** — flat UI-string dictionaries, one file per locale
  (`en.yaml`, `es.yaml`, …). `src/i18n/index.ts` exposes a
  `useTranslations(locale)` helper that resolves a key for the current
  locale, falling back to English.
- **`astro.config.mjs`** — set `site` to your production URL before deploying;
  it feeds the sitemap, RSS feed, and canonical/OG tags.

## Project structure

```
src/
  components/     One Astro component per section/partial
  config/         Typed site configuration (site.ts)
  content/        Content collections, organized by <collection>/<locale>/
  content.config.ts   Zod schemas for every content collection
  i18n/           Per-locale UI string dictionaries + locale helpers
  layouts/        Base page shell (head, header, footer)
  pages/          Routes, under a [locale] dynamic segment
  styles/         Global + per-section CSS
```

See [`CONVENTIONS.md`](CONVENTIONS.md) for the detailed patterns behind file
layout, content collections, i18n, and image handling.

## Credit

This is an **Astro port of the [Adritian Hugo theme](https://github.com/zetxek/adritian-free-hugo-theme)**,
rebuilding the same design and feature set on Astro's content collections
and i18n routing instead of Hugo.

## Acknowledgments

Development of this port was AI-assisted using [Claude Code](https://claude.com/claude-code) 🤖.

## License

MIT — see [LICENSE](LICENSE).

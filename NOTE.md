# Phase 2 batch A — status

All 6 sections ported and wired into both `/en/` and `/es/` homepages:
about, showcase, text-section, spacer, platform-links, client-and-work.

## Validation done
- `npm run build` exits 0.
- `dist/en/index.html` and `dist/es/index.html` both render sections in
  order: about → showcase → experience → client-and-work → extra text
  content (grepped `id="..."` order in built HTML).
- 12 `<picture>`/`<img>` elements per homepage, all with `type="image/webp"`
  sources — no raw `<img src="/images/...">` into `public/`.
- ES homepage renders Spanish strings (`¿Quién soy?`, `Una selección de mi
  trabajo`, `Contenido extra...`); `clients`/`projects` have no ES content
  yet, so their fallback badge (`isFallback`) correctly shows on `/es/`
  (grepped `en (fallback)` — 0 on `/en/`, 5 on `/es/`), proving
  `getLocalizedCollection` fallback works for these new collections too.

## Deviations from a literal Hugo port
- **showcase.yml**: Hugo's `exampleSite/data/showcase.yml` is a *different*
  feature (a community "sites built with this theme" list page, rendered
  by `layouts/_default/showcase.html`/`content/showcase.md`) — unrelated to
  the homepage hero also named "showcase" (`showcase-section` shortcode /
  `partials/showcase.html`). Only the homepage hero was in scope per the
  task's 6-section/6-file list; the community showcase list page was not
  ported. The hero's content (title/subtitle/description/image) is instead
  modeled as a new `showcase` content collection (one YAML entry per
  locale) so it's still "data-driven" per the task's ask, just not sourced
  from `showcase.yml`.
- **platform-links icons**: Hugo uses a custom icon font
  (`adritian-icons`, `static/fonts/adritian-icons.*`) with ~18 glyphs.
  Ported as inline SVGs (`PlatformLinks.astro`) instead of shipping a font,
  limited to the 6 icons with real destination URLs in the Hugo exampleSite
  (Facebook, X/Twitter, LinkedIn, GitHub, Instagram, YouTube). Dropped the
  ~12 icons that pointed at `#` or repeated placeholder links
  (Dribbble/Behance/Codepen/Yelp/Bluesky/Threads/etc.) — these looked like
  icon-showcase filler in the theme's demo content, not real profiles.
- **about button icon**: Hugo's about-section button has a
  `button_icon="icon-user"` (icon-font glyph) before the label. Dropped —
  decorative only, and adding one more one-off icon wasn't worth a second
  icon-rendering path for a single glyph.
- **Fixed a latent Hugo bug rather than reproducing it**: `home.md`'s
  `showcase-section` shortcode passes `buttonText="Email"`, but the actual
  partial parameter is `button_text` — so the showcase CTA silently never
  renders in the Hugo exampleSite. The Astro `showcase` collection uses the
  correctly-named `buttonText` field, so the port's showcase section does
  render its button.
- **`education`, `testimonial`, `contact`, `newsletter`** homepage
  sections remain untouched placeholders (`false` in
  `siteConfig.sections`) — out of scope for this batch, left for a later
  phase.
- **`clients`/`projects` collections have no ES entries** — deliberate,
  to exercise/prove the `getLocalizedCollection` fallback path per the
  acceptance criteria; add `src/content/clients/es/*.md` and
  `src/content/projects/es/*.md` in a later phase for real ES content.

No new dependencies were added — inline SVG icons and the existing
`image()`/`<Picture>`/`glob()` primitives covered everything.

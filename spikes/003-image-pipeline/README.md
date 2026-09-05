# Spike 003 — Image Pipeline (astro:assets vs. Hugo Pipes)

## Spike question

**Given** a content collection entry whose frontmatter references a company logo image (`companyLogo`),
**when** the site is built with Astro's native image pipeline (`astro:assets`),
**then** can we reproduce Hugo Pipes' behavior — webp conversion, a responsive srcset at matching
widths/densities, an original-format fallback, and `loading="lazy" decoding="async"` — using the
collection schema alone, with no hardcoded static `import` per image?

## What Hugo does today (reference behavior)

Studied in `/Users/zetxek/git/adritian-free-hugo-theme`:

- **`layouts/partials/experience.html`** (actual usage for company logos): `resources.Get
  .Params.companyLogo` → single `Resize "<w>x<h> webp q75 Lanczos picture"` → one `<img>` tag,
  no srcset at all. `class="experience__company-logo"`, `loading="lazy"`, no `decoding`.
- **`layouts/partials/lazypicture.html`** (general-purpose partial, not used by `experience.html`
  but the theme's canonical responsive-image pattern): resolves a target size from
  width/height/scale params, then generates **1x and 2x** variants (`Resize` twice), emits a
  `<picture>` with a `webp` `<source>` and an original-format `<source>`, and an `<img>` fallback
  using a base64 GIF placeholder + `data-src` + a JS lazy-load library (`lozad`), plus native
  `loading="lazy" decoding="async"` as belt-and-suspenders.
- **`layouts/partials/responsive-image.html`** (newer/alternate partial): width-based srcset at
  fixed breakpoints (400/800/1200, clamped to the source's native width) with a `sizes` attribute,
  again webp + original-format `<source>`s, native lazy loading, no JS shim.

None of these are used verbatim for the experience logo in production Hugo — the actual
`experience.html` only does a single resize. For this spike we targeted the **more capable,
documented pattern** (`lazypicture.html`'s 1x/2x density approach), since it's the closest fit for
a small fixed-size logo and it's what the task asked to reproduce as closely as possible.

## Pattern that works

1. **Collection schema uses the `image()` helper**, not `z.string()`:

   ```ts
   // src/content.config.ts
   const experience = defineCollection({
     loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
     schema: ({ image }) =>
       z.object({
         // ...
         companyLogo: image().optional(),
       }),
   });
   ```

2. **The image file must live under `src/`, colocated with the content it belongs to**, and be
   referenced by a *relative path* in frontmatter — not `public/`:

   ```
   src/content/experience/job-1.md
   src/content/experience/images/internet-affairs.png
   ```

   ```md
   ---
   companyLogo: "./images/internet-affairs.png"
   ---
   ```

   `image()` resolves this relative to the entry file and returns a fully-typed `ImageMetadata`
   object in `entry.data.companyLogo` (width/height/format included) — not a string. This is the
   fix for the friction spike 001 hit: a bare `z.string()` path into `public/` gets served
   unprocessed, with no resizing, no format conversion, no fingerprinting.

3. **Render with `<Picture>` from `astro:assets`**, using `densities` to mirror Hugo's 1x/2x
   scheme (the logo displays at a fixed 48×48 per `experience.css`):

   ```astro
   ---
   import { Picture } from 'astro:assets';
   ---
   {entry.data.companyLogo && (
     <Picture
       src={entry.data.companyLogo}
       alt={`${entry.data.company} logo`}
       class="experience__company-logo"
       width={48}
       height={48}
       densities={[1, 2]}
       formats={['webp']}
       loading="lazy"
       decoding="async"
     />
   )}
   ```

   `<Picture>` automatically adds an original-format fallback `<source>`/`<img>` alongside the
   `webp` source — no extra config needed for that part.

## Validation (acceptance criterion)

`npm install && npm run build` succeeds cleanly:

```
generating optimized images
  ▶ /_astro/internet-affairs.*.webp (48x48)
  ▶ /_astro/internet-affairs.*.webp (96x96)
  ▶ /_astro/internet-affairs.*.jpg  (48x48)
  ▶ /_astro/internet-affairs.*.jpg  (96x96)
```

`dist/_astro/` contains 4 processed files — webp + original-format (the source file is actually a
JPEG despite its `.png` extension; Sharp detected the real format and used it for the fallback) —
at 48×48 (1x) and 96×96 (2x). Confirmed with `file`:

```
internet-affairs.*.webp: Web/P image, VP8 encoding, 96x96
internet-affairs.*.webp: Web/P image, VP8 encoding, 48x48
internet-affairs.*.jpg:  JPEG image data, baseline, 96x96
internet-affairs.*.jpg:  JPEG image data, baseline, 48x48
```

`dist/index.html` contains the expected markup:

```html
<picture>
  <source srcset="/_astro/….webp, /_astro/…_48.webp 1x, /_astro/…_96.webp 2x" type="image/webp">
  <img src="/_astro/…_48.jpg" srcset="/_astro/…_48.jpg 1x, /_astro/…_96.jpg 2x"
       alt="Internet Affairs Inc. logo" loading="lazy" decoding="async"
       width="48" height="48" class="experience__company-logo">
</picture>
```

`loading="lazy"`, `decoding="async"`, and the original `experience__company-logo` class all made
it through unchanged from the Hugo version.

One cosmetic quirk: Astro's `<Picture>`, when given `densities` instead of `widths`, emits the
base (1x) URL once *without* a descriptor and then again *with* `1x` (`"url, url 1x, url2x 2x"`).
This is `<Picture>`'s own behavior (visible in `node_modules/astro/components/Picture.astro`), not
something this spike introduced. It's redundant but valid — browsers pick correctly — and is worth
knowing about, not fixing.

## Honest gaps vs. Hugo's pipeline

- **Arbitrary/dynamic paths.** Hugo's `resources.Get` resolves any string path at render time,
  including ones built from arbitrary params. Astro's `image()` schema helper needs statically
  analyzable relative paths resolved at build time from known content files. This works fine for
  content-collection frontmatter (this spike) but doesn't extend to, say, a path assembled from a
  CMS-driven string at runtime, or images referenced from plain data files (YAML/JSON site config,
  not a collection with a schema) — those need a different mechanism (static `import`, or
  `getImage()` called imperatively with a dynamically-resolved `import()`).
- **`public/` is a dead end for processing.** Any image that needs to stay in `public/` (e.g.
  because non-Astro tooling also needs a raw copy) simply never gets touched by `astro:assets`.
  Hugo doesn't have this split — `resources.Get` reaches into `assets/` uniformly. Porting the
  theme means an inventory-and-move pass: every image that wants processing has to physically live
  under `src/`.
- **No blur-up / LQIP placeholder.** Hugo's `lazypicture.html` ships a (crude) base64 GIF
  placeholder + JS lazy-load shim; `astro:assets` has no built-in low-quality-placeholder or
  blur-up generation at all — native `loading="lazy"` only. If real blur-up is wanted, that's a
  separate library (e.g. `unpic`, `astro-imagetools`) or a hand-rolled Sharp pass, not something
  `<Picture>` gives for free. In practice this is a wash: the theme's actual production partial
  (`responsive-image.html`) also skips blur-up in favor of plain native lazy loading, so the target
  behavior is achievable either way.
- **Sizing ergonomics are more manual.** Hugo's `.scale`/width/height dict params compute target
  dimensions from the source image at render time with one shorthand. Astro requires explicit
  `width`/`height` (or `widths`/`densities`) per usage site — more boilerplate per component, though
  arguably more explicit and typo-safe (TypeScript checks the props).
- **Format flexibility is roughly at parity.** Both can trivially add AVIF (`formats: ['avif',
  'webp']` vs. an extra `Resize … avif …` call) — this isn't a real gap.

## Estimated cost to apply across the full theme

- **Per-collection schema change**: small, one-time — add `image()` to every collection schema
  with an image-bearing field (logos, blog cover images, project thumbnails, avatars). Maybe
  30–60 min total across the theme's collections.
- **Asset relocation**: the bulk of the work. Every image currently sitting in `public/` that's
  referenced from content frontmatter has to move under `src/` and be re-pointed to a relative
  path. For a theme-sized image set (logos, hero backgrounds, blog images, favicons, project
  screenshots) this is likely a half-day to a day of mechanical-but-careful work, plus retesting
  every page that renders an image.
- **Non-collection images** (site config/data files, not frontmatter): need a separate, manual
  pattern — static imports or imperative `getImage()` — component by component. Budget this
  separately; it's not covered by this spike and doesn't reuse the `image()` win.
- **Component conversions**: swapping raw `<img>`/hand-rolled `<picture>` for `<Picture>`/`<Image>`
  per component, tuning `widths`/`densities`/`sizes` to match each partial's original intent
  (fixed-size icons vs. full-width responsive content images use different props). A few hours
  across the theme's image-bearing components.
- **Blur-up**, if desired for parity-plus (Hugo doesn't really give this either): separate spike,
  not a tweak.

## Verdict: **VALIDATED**

The `image()` schema helper + `<Picture>` from `astro:assets` reproduces Hugo's webp conversion,
responsive srcset (density-based, matching `lazypicture.html`), original-format fallback, and
`loading="lazy" decoding="async"` attributes for a content-collection-frontmatter image, without
any hardcoded per-image static import. The build produces real multi-width webp output and correct
markup — verified, not assumed.

**Recommendation for the real build:** adopt this pattern (`image()` in schema + `<Picture>` in
components) as the standard for any image field on a content collection. Plan a dedicated
"move everything out of `public/` into `src/`" pass early in the port — it's the main cost driver
and it's mechanical enough to batch. Treat non-collection (data-file-driven) images as a separate,
smaller follow-up problem with a different solution shape. Skip blur-up/LQIP unless it's an actual
product requirement — Hugo isn't giving the team that today either.

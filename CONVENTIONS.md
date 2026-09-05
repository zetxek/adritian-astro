# Conventions — Adritian Astro port

Distilled from `docs/spikes/001-experience-section`, `docs/spikes/002-i18n`, and
`docs/spikes/003-image-pipeline`. Every pattern below is **validated** (built and
inspected in `dist/`, not just theorized). Follow these when porting further
Hugo sections/partials in later phases.

## 1. File layout

```
src/
  components/       Astro components. One responsibility each (a Hugo partial
                     or shortcode maps ~1:1 to a component).
  config/
    site.ts          Typed "ambient config" — the Astro equivalent of
                     .Site.Params from hugo.toml.
  content/
    <collection>/
      <locale>/
        <slug>.md    Content collection entries, always under a locale folder.
      images/        Images colocated under src/ (NOT public/) so image()
                     can process them. Shared across locales by relative path.
  content.config.ts Collection schemas (zod), one per collection.
  i18n/
    en.yaml          UI string dictionary. Flat "key": "value", same shape
    es.yaml          as Hugo's i18n/*.yaml — near-zero-migration from Hugo.
    index.ts         useTranslations(locale) -> t(key) helper + locale consts.
    mergeContent.ts  getLocalizedCollection() — replicates Hugo's lang.Merge.
  layouts/
    Layout.astro     The single base shell (baseof.html equivalent): head,
                     header/nav, <slot />, footer, global scripts.
  pages/
    en/index.astro   Explicit per-locale route files (not a [locale] dynamic
    es/index.astro   route) — matches Astro's prefixDefaultLocale routing and
    en/experience/   keeps each locale's page composition inspectable and
    es/experience/   independently overridable, mirroring Hugo's *.es.md
                     per-language content files.
  styles/
    global.css       Site-wide shell styles ported from Hugo's SCSS partials
                     (navbar, theme-init, skip-link, footer). Plain CSS, no
                     Sass — Astro's Vite pipeline needs no preprocessor for
                     what the theme actually uses.
    <section>.css    One stylesheet per section/component, imported directly
                     by the component that needs it (co-located, not a global
                     bundle) — e.g. experience.css imported by ExperienceSection.
```

Do not put content-referenced images in `public/`. `public/` is only for
files that must be served byte-for-byte unprocessed (favicons, robots.txt).

## 2. Content collections

- Schema lives in `src/content.config.ts`, one `defineCollection` per
  section, loaded with `glob()`.
- Localized content is folder-based: `src/content/<collection>/<locale>/<slug>.md`.
  The collection entry's `id` is `"<locale>/<slug>"` — every locale-aware
  query splits on the first `/` to recover locale and slug.
- Do **not** create a separate collection per locale. One collection, split by
  folder — this is what makes `getLocalizedCollection` possible.

```ts
// src/content.config.ts
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      title: z.string(),
      jobTitle: z.string(),
      company: z.string(),
      location: z.string(),
      duration: z.string(),
      companyLogo: image().optional(), // image(), never z.string() — see §4
    }),
});
export const collections = { experience };
```

## 3. i18n

**Routing** — Astro's built-in i18n, no third-party library:

```js
// astro.config.mjs
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'es'],
  routing: { prefixDefaultLocale: true },
},
redirects: { '/': '/en/' }, // static output can't use Astro.redirect()
```

**UI strings** — flat YAML dictionaries loaded with `?raw` + `js-yaml`,
keeping Hugo's `i18n "key"` shape so existing `i18n/*.yaml` files port with
near-zero changes:

```ts
// src/i18n/index.ts
export function useTranslations(locale) {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
  return (key) => dict[key] ?? dictionaries[defaultLocale][key] ?? key;
}
```

Every page/component that renders UI text takes a `locale` prop and calls
`const t = useTranslations(locale)` — thread `locale` explicitly through
props, don't infer it from `Astro.url` deep in a component tree.

**Content fallback (Hugo's `lang.Merge`)** — Astro's own `i18n.fallback`
config only covers whole missing *routes*, not partial content mixed into
one rendered list. Use the hand-rolled merge utility instead:

```ts
// src/i18n/mergeContent.ts
export async function getLocalizedCollection(collection, locale) {
  const all = await getCollection(collection);
  const bySlug = new Map();
  for (const entry of all) {
    const [entryLocale, ...slugParts] = entry.id.split('/');
    if (entryLocale === defaultLocale) {
      bySlug.set(slugParts.join('/'), { entry, isFallback: locale !== defaultLocale });
    }
  }
  if (locale !== defaultLocale) {
    for (const entry of all) {
      const [entryLocale, ...slugParts] = entry.id.split('/');
      if (entryLocale === locale) bySlug.set(slugParts.join('/'), { entry, isFallback: false });
    }
  }
  return [...bySlug.values()];
}
```

Default locale entries seed the map (the fallback layer); the requested
locale's entries overlay on top. Any collection needing fallback content
reuses this one function — it is not `experience`-specific.

## 4. Images

- Collection schema field uses `image()`, never `z.string()`. A bare string
  path into `public/` is served unprocessed — no resize, no format
  conversion, no fingerprinting.
- The image file lives under `src/`, colocated with the content that
  references it, addressed by a **relative path** in frontmatter:
  `companyLogo: "../images/internet-affairs.png"`.
- Render with `<Picture>` from `astro:assets`, using `densities` to mirror
  Hugo's `lazypicture.html` 1x/2x scheme:

```astro
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
```

`<Picture>` adds the original-format fallback source automatically. Skip
blur-up/LQIP — Hugo's production partial doesn't do it either, so there's no
parity gap.

## 5. Components

- One Astro component per Hugo partial/shortcode; typed `Props` interface,
  no implicit `any`.
- Preserve Hugo's Bootstrap class names verbatim (`section-experience`,
  `experience__company-logo`, `bd-navbar`, …) — this is a class-name-stable
  port, not a redesign. New CSS should target the same selectors Hugo's SCSS
  did.
- Components that render text take an explicit `locale` prop and call
  `useTranslations(locale)` themselves — don't pass a pre-resolved `t`
  function down, since that hides which locale a leaf component is
  rendering for for.

## 6. CSS

- Hugo's theme SCSS is extracted to plain CSS per concern, no Sass build
  step — Astro's own asset pipeline (Vite) handles `<style>`/`.css` imports
  without needing a preprocessor for what this theme actually uses.
- Dark mode follows Hugo's own mechanism exactly: `[data-bs-theme='dark']`
  attribute on `<html>`, toggled by a ported `color-modes.js`, persisted to
  `localStorage['theme']`. Do not switch to `prefers-color-scheme` media
  queries alone — the toggle + `auto` option must remain user-controllable.
- An inline (`is:inline`, unbundled) anti-flash script in `<head>` sets
  `data-bs-theme` before first paint, exactly mirroring Hugo's inline
  snippet in `head.html`. The full interactive logic (click handlers,
  `localStorage` sync) lives in a separate bundled script, matching Hugo's
  split between the inline snippet and `assets/js/color-modes.js`.
- Section styles are co-located per component (`experience.css` next to
  `ExperienceSection.astro`), not merged into one theme-wide bundle — makes
  it obvious which CSS a given section owns when porting the next section.

## 7. Site config

`src/config/site.ts` is a typed object replicating the `[params]` surface of
`hugo.toml`/`exampleSite/hugo.toml` — title, description, baseURL, author,
social links, per-section toggles, homepage list counts. Components read
from this object the way Hugo templates read `.Site.Params.*`. Add fields
here rather than hardcoding values in components.

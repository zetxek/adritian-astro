# Spike 002 — i18n strategy

Standalone Astro project. Does not modify or depend on the repo-root scaffold.

## Spike question

**Given** the Hugo theme's i18n model — 14 `i18n/*.yaml` string dictionaries plus
`lang.Merge`, which fills in any content missing from a non-default locale with the
default locale's version (so partial translations never produce blank sections) —
**when** we port the theme to Astro 5,
**then** can we reproduce both the string-dictionary pattern and the content
fallback behavior with Astro's built-in i18n routing and no (or minimal) extra
i18n library, while keeping per-locale content authored as plain files?

## What was built

- Astro's built-in i18n routing: `/en/` (default, prefixed) and `/es/`.
- UI string dictionaries at `src/i18n/en.yaml` / `es.yaml`, in the same flat
  `"key": "value"` shape as Hugo's `i18n/*.yaml`.
- The `experience` content collection has 3 EN entries and only 1 ES entry
  (`src/content/experience/es/job-1.md`). The `/es/` page renders the ES
  translation for job 1, and falls back to the EN version of jobs 2 and 3 —
  each fallback entry is tagged `data-locale="en (fallback)"` and shows a
  visible fallback badge, so the behavior is inspectable in the rendered HTML,
  not just asserted.

## Library comparison

| Option | Approach | Pros | Cons / maintenance | Verdict |
|---|---|---|---|---|
| **Astro built-in i18n routing** (`astro:i18n`) | Native routing config (`locales`, `defaultLocale`, `routing.prefixDefaultLocale`), `getRelativeLocaleUrl()` helpers. Ships a page-level `fallback` option (redirect/rewrite a whole *missing route* to the default locale). | Zero dependencies, actively developed by the Astro core team, stable since v4/v5. | Its `fallback` only covers **entire missing pages**, not partial content within one rendered page — doesn't replicate `lang.Merge` by itself. | **Used** for routing. |
| **Paraglide JS** (`@inlang/paraglide-astro`) | Compile-time message extraction, tree-shaken per-locale JS bundles, typed message keys. | Actively maintained (Opral), strong TS support, smallest client JS payload, no Astro adapter needed since 2.0. | Solves *UI string* i18n only — still doesn't touch content-collection fallback. Adds a build step (message compiler) and a new toolchain (inlang) on top of what a YAML file already gives us for a 2-locale spike. | Not used — overkill for dictionary needs already met by YAML + a loader. |
| **astro-i18n** (Alexandre-Fernandez) | TS-first i18n lib with its own routing/translation APIs. | TypeScript-first. | Latest release ~2 years old, no dependents on npm — thin maintenance signal in 2026. | Not used. |
| **@nanostores/i18n** | Nanostore-based reactive dictionaries, framework-agnostic. | Actively published, works well for **interactive/client-side** i18n (islands). | Designed for reactive client state, not for static-build content fallback; would be extra machinery for a mostly-static theme. | Not used. |
| **typesafe-i18n** | Code-gen'd typed translation functions. | Strong typing, framework-agnostic. | Generic codegen pipeline (own CLI/watch step); no particular advantage over the YAML+util approach for this theme's needs, and no Astro-specific integration to evaluate. | Not used. |

**Picked: Astro's built-in i18n routing + a hand-rolled ~15-line dictionary
loader + a hand-rolled ~35-line content-merge utility.** None of the libraries
above solve the content-fallback half of the problem (that's a content-collection
concern, not a UI-string concern), so pulling one in would only address half the
requirement while adding a dependency and a second toolchain. The other half —
merge-on-missing-slug — is small enough to write directly and keeps the
mental model close to Hugo's (`lang.Merge` → a `Map` overlay).

## How the dictionary works (Hugo `i18n "key"` equivalent)

`src/i18n/en.yaml` / `es.yaml` keep Hugo's exact flat-YAML shape. They're loaded
with a Vite `?raw` import + `js-yaml` (`src/i18n/index.ts`), no content-collection
indirection needed:

```ts
export function useTranslations(locale) {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
  return (key) => dict[key] ?? dictionaries[defaultLocale][key] ?? key;
}
```

Per-key fallback to `defaultLocale` mirrors Hugo's behavior when a translation
key is missing from a non-default locale file.

## How `lang.Merge` fallback was replicated

Hugo's original (`layouts/partials/experience.html`):

```go
{{ $xp := where .Site.RegularPages.ByDate "Type" "experience" }}
{{ $baseLangSite := hugo.Sites.Default }}
{{ $xp = $xp | lang.Merge (where $baseLangSite.RegularPages.ByDate.Reverse "Type" "experience") }}
```

`lang.Merge` takes the current-locale page list and merges in the default-locale
list, with the current locale winning on key collisions (matched by translation
key / filename) and the default locale filling in everything else.

Astro equivalent (`src/i18n/mergeContent.ts`), content organized as
`src/content/experience/<locale>/<slug>.md`:

```ts
export async function getLocalizedCollection(collection, locale) {
  const all = await getCollection(collection);
  const bySlug = new Map();

  // 1. Seed with the default locale — this is the fallback layer.
  for (const entry of all) {
    const [entryLocale, ...slugParts] = entry.id.split('/');
    if (entryLocale === defaultLocale) {
      bySlug.set(slugParts.join('/'), { entry, isFallback: locale !== defaultLocale });
    }
  }

  // 2. Overlay with the requested locale's translations, when present.
  if (locale !== defaultLocale) {
    for (const entry of all) {
      const [entryLocale, ...slugParts] = entry.id.split('/');
      if (entryLocale === locale) {
        bySlug.set(slugParts.join('/'), { entry, isFallback: false });
      }
    }
  }

  return [...bySlug.values()];
}
```

Astro's built-in `i18n.fallback` config was evaluated first and rejected for this
part: it operates at the *route* level (missing `/es/some-page` → serve/redirect
to `/en/some-page`), not at the *content-item-within-a-rendered-page* level. Since
Hugo's `experience` section shows one page with a mixed list of translated and
fallback items, the merge had to be hand-rolled — there's no way around it with
routing-level fallback alone, regardless of which UI-string library is chosen.

## Validation

```
$ npm run build
...
11:27:23   ├─ /en/index.html
11:27:23   ├─ /es/index.html
11:27:23   ├─ /index.html
✓ Completed
```

Inspected `dist/es/index.html`:
- Contains `Mi experiencia laboral` / `Spike de portado a Astro de Adritian` (ES UI strings) ✅
- Contains `Empleo n.º 1` / `Becario Junior` (the one ES-translated job) ✅
- Contains `Chief Intern` and `CIO` (jobs 2 and 3, untranslated, served from EN) ✅
- `data-locale` attributes confirm provenance: `es` for job 1, `en (fallback)` for jobs 2 and 3 ✅

`dist/index.html` is a static meta-refresh redirect to `/en/` (via Astro's
`redirects` config, since `Astro.redirect()` requires on-demand rendering and
this project is static output).

## Friction / honesty check

- The merge utility is currently typed for a single collection name
  (`'experience'`); generalizing it to any collection (blog, testimonials,
  education, clients) is mechanical but not free — each collection needs the
  same `<locale>/<slug>` folder convention, and any collection with nested
  taxonomies (tags, categories) needs those merged too, which this spike
  doesn't test.
- This only handles **content collections**. Hugo's `lang.Merge` in the real
  theme is also applied to things like `.Site.RegularPages` for cross-content
  listings (blog index, tag pages) — those aren't collections in the Astro
  sense and would need their own merge call sites.
- Astro's own `i18n.fallback` (page-level) still has a place in the real build
  for whole pages that don't exist per-locale (e.g., a locale skips an entire
  optional page) — it's complementary to, not replaced by, the content merge.
- No RTL handling was attempted (out of scope for EN/ES), see cost estimate below.

## Estimated cost to apply across the full theme

Basis: 71 templates, 16 shortcodes, 14 locales (13 languages + Hebrew RTL).

| Item | Estimate | Notes |
|---|---|---|
| Routing + dictionary infra (this spike's pattern, generalized) | 0.5–1 day | Mostly done; needs to become collection-agnostic. |
| Convert 71 templates (`{{ i18n "key" }}` → `t('key')`, wire `locale` prop) | 3–5 days | Mechanical but must be done per-file; risk is missed strings, not logic. |
| Convert 16 shortcodes to Astro components | 1.5–2.5 days | Shortcodes become components taking `locale`/props; some may fold into existing components. |
| Generalize content-merge utility to all collections (blog, testimonials, education, clients) | 1–2 days | Needs per-collection `<locale>/<slug>` folder migration of existing content. |
| Author/migrate 14 locale dictionaries (YAML already Hugo-compatible) | Translation effort, not engineering — content-only if reusing existing Hugo `i18n/*.yaml` files | Can likely be copied near-verbatim; key names should match 1:1. |
| RTL support for Hebrew (`dir="rtl"`, logical CSS properties, mirrored layout) | 2–4 days | Astro's `i18n` config doesn't auto-set `dir`; needs manual `<html dir>` logic + a CSS audit (71 templates' worth of `margin-left`/`float` etc.). |
| **Total engineering estimate** | **~9–15 days** | Excludes actual translation writing/review time, which is a separate content workstream. |

## Verdict: **VALIDATED**

The core mechanism — string dictionaries from YAML + a small merge utility
replicating `lang.Merge` — works, builds cleanly, and is inspectable in the
build output. It requires no new i18n library; the only new dependency is
`js-yaml` (already a transitive dependency of Astro itself, since Astro's own
`file()` content loader uses it internally).

**Recommendation for the real build:**
1. Adopt Astro's built-in i18n routing for URL structure — do not add a
   third-party routing library.
2. Keep the YAML dictionary pattern; it's a near-zero-migration path from the
   existing Hugo `i18n/*.yaml` files.
3. Generalize `getLocalizedCollection` into a shared utility usable by every
   content collection, and standardize all localized content under
   `<collection>/<locale>/<slug>` folders during the port.
4. Budget RTL (Hebrew) as its own workstream, separate from the i18n
   plumbing — it's a CSS/layout concern, not a routing or data concern, and
   the spike here (EN/ES only) doesn't exercise it.
5. Treat non-collection content fallback (paginated lists, taxonomies) as a
   follow-up spike before committing to full-theme scope — this spike only
   proves the pattern for a single collection.

# Phase 3 — status

All 5 remaining homepage sections ported and wired into both `/en/` and
`/es/` homepages: skills, education, testimonial, contact, newsletter.
Combined with Phase 2's about/showcase/experience/client-and-work, the
homepage is now feature-complete relative to the Hugo exampleSite.

## Final homepage section order (both locales)

`about → showcase → experience-section → skills-section → education →
client-and-work-section → testimonial → contact → newsletter → extra-content`

All toggleable via `siteConfig.sections` (`src/config/site.ts`).

## Validation done
- `npm run build` exits 0.
- `dist/en/index.html` and `dist/es/index.html` both render all 9 homepage
  sections + extra-content in the order above (grepped `id="..."` order).
- 8 `<picture>` elements per homepage with `type="image/webp"` sources
  (testimonial avatars added to Phase 2's client/project logos); no raw
  `<img src="/images/...">` into `public/`.
- Contact form: `<form action="https://formspree.io/f/mail@example.com"
  method="POST">` — native attributes, works without JS (Formspree).
- Newsletter form: `<form id="rad-subscription" action="/" method="POST">`
  — native attributes present; a bundled `<script>` in `NewsletterSection`
  progressively enhances the same form with `fetch`+success/fail toggling.
- ES homepage shows Spanish strings for all 5 new sections (`Educación`,
  `Contáctame`, `Subscríbete`, `Lo que dicen de mí`) — grepped for 0 EN
  leakage (`Reach out`, `Stay updated` do not appear on `/es/`).
- `education`, `skills`, `testimonial` have no ES content in the Hugo
  exampleSite either, so `/es/` correctly shows the EN-fallback badge
  (`isFallback`) for all 8 of their entries (2 education + 1 skills
  singleton +... — grepped `en (fallback)` count: 8 on `/es/`, 0 on `/en/`),
  proving `getLocalizedCollection` fallback still holds for the new
  collections.
- Skill bars: 10 `.skill-bar-fill` divs render (2 categories × 5 skills)
  with inline `width` percentages.

## Deviations from a literal Hugo port
- **`skills` is a homepage section here, not a standalone `/skills` page.**
  In the Hugo theme, skills is `layouts/skills/list.html`, a dedicated page
  type linked from the About section's button (`/skills`) — it is **not**
  invoked on the homepage at all. This phase's task explicitly asked for
  skills as one of 5 *homepage* sections in a specific order, so it's
  modeled as a `SkillsSection` component + singleton per-locale `skills`
  content collection (mirroring `showcase`'s pattern) rendered inline on
  `/en/` and `/es/`. `siteConfig.about.buttonUrl` still points at `/skills`
  (a page that doesn't exist yet) — out of scope for this phase; a later
  phase should either add a standalone `/skills` route or repoint the
  button at the homepage anchor (`#skills-section`).
- **`contact` and `newsletter` are homepage sections, not footer content.**
  In Hugo, both shortcodes live in a separate `content/footer/footer.md`
  content type rendered inside the global `<footer>` (so they appear on
  *every* page, not just the homepage). This phase places them as ordinary
  toggleable homepage sections per the task's explicit ask ("complete
  homepage parity... contact/newsletter as applicable") — they render once,
  on the homepage, not site-wide in the footer.
- **Contact i18n keys use working names, not Hugo's broken ones.** Hugo's
  `layouts/partials/contact.html` calls `i18n "contact_name_placeholder"`,
  `"contact_button_text"`, `"contact_phone_heading"`, etc. — none of these
  keys exist in either `i18n/en.yaml` or `i18n/es.yaml` (a latent bug masked
  because the exampleSite always supplies explicit shortcode params). This
  port defines and uses working key names instead of reproducing the bug.
- **Contact `phone`/`email`/`location` are per-locale `siteConfig.contact.info`,
  not content-collection or i18n data** — they're site-identity data (like
  Hugo's shortcode params), rendered via `set:html` the same way showcase's
  `description` field already is. Also normalized the ES email to an
  anchor tag (Hugo's `footer.es.md` has a plain-text email, inconsistent
  with EN's `<a href="mailto:...">` — looked like an oversight, not
  intentional).
- **Newsletter JS fixes a Hugo bug instead of reproducing it.** Hugo's
  `static/js/subscription.js` hardcodes `fetch("", {...})` — it ignores the
  form's actual `action`/`method` attributes and always POSTs to the
  current page. This port's bundled script reads `form.action`/`form.method`
  so the fetch actually targets the configured endpoint (`siteConfig.newsletter`).
  The demo's `formAction: '/'` (same as Hugo's exampleSite) is still not a
  real ESP integration — swapping in a real provider only requires changing
  that one config value.
- **Contact section drops the decorative background image** (Hugo's
  `.section--contact` uses `static/img/general/contact-bg.png`/
  `contact-bg-dark.png`, a repeating wave graphic). Not ported — no
  equivalent asset was pulled into `src/`, and it's purely decorative;
  the section still gets a themed elevated-card look via box-shadow.
- **Testimonial icon font replaced with inline SVG**, consistent with
  Phase 2's `PlatformLinks` approach — `icon-quote-left` (glyph from the
  bundled `adritian-icons` font) becomes a small inline quote SVG in
  `TestimonialSection.astro`, avoiding a second font-shipping code path for
  one glyph.
- **`education`, `skills`, `testimonial` have no ES content in the Hugo
  exampleSite** (confirmed by inspecting `exampleSite/content/es/` and the
  built `exampleSite/public/es/` output — Spanish homepage renders these
  sections' *headings* only, with empty bodies, in the original theme).
  This port's `getLocalizedCollection` fallback surfaces the EN content on
  `/es/` with a visible "shown in English" badge instead of rendering
  empty sections — a deliberate improvement over Hugo's actual behavior,
  not a literal bug-for-bug port.

## What remains for Phase 4 (blog)
- No blog/post content type, list, or single-page templates exist yet in
  the Astro port. Hugo's blog-related layouts/shortcodes/content
  (`content/posts/` or similar, if present in the exampleSite) are
  untouched.
- No standalone `/skills` page (see deviation above) — only the homepage
  section exists.
- `clients`/`projects`/`education`/`skills`/`testimonial` still have no
  real ES content — all rely on EN fallback. Adding ES translations for
  these collections is optional follow-up, not blocking.

# Phase 4 — blog (status: done)

Full blog feature ported for both `/en/blog/` and `/es/blog/`: content
collection, list + pagination, single post, TOC, sidebar, related posts,
social sharing, comments, reading progress, and tag pages.

## What was ported
- **Content collection** (`src/content.config.ts`): `blog`, schema `title,
  date, description, tags[], cover (image()), draft, toc, tocSticky`.
  Entries live at `src/content/blog/<locale>/<slug>.md`, same
  `getLocalizedCollection` fallback pattern as every other collection.
- **4 EN posts** ported from `exampleSite/content/blog/`: `getting-started`,
  `color-schemes` (toc:true, tocSticky:true — the one long/headed-enough
  post to exercise TOC gating), `seo-features`, `icons`. Cover images
  copied from the Hugo exampleSite's `static/img/blog/` into
  `src/content/blog/images/`. No ES posts exist in the Hugo exampleSite
  either (confirmed: only Arabic/Hebrew `_index` translations, no Spanish
  blog content at all) — `/es/blog/` shows all 4 posts via EN fallback,
  consistent with `education`/`skills`/`testimonial` from Phase 3.
- **List + pagination** (`src/pages/<locale>/blog/index.astro` +
  `page/[page].astro`, shared body in `BlogListPage.astro`): hand-rolled
  pagination (`src/lib/blog.ts` `paginate()`) rather than Astro's
  `paginate()` rest-route helper, so page 1 lives at `/blog/` and later
  pages at `/blog/page/N/`, matching Hugo's `_internal/pagination.html`
  URL scheme. `pagerSize` (3) matches `exampleSite/hugo.toml`'s
  `[pagination] pagerSize = 3`. Cards show cover (`<Picture>` webp),
  date, description, tags, fallback badge.
- **Single post** (`src/pages/<locale>/blog/[slug]/index.astro`, shared
  body in `BlogPost.astro`): title, date, reading time (word-count/200,
  min 1 — same formula as Hugo's `blog/single.html`), tags, cover,
  rendered content, TOC, sharing, related posts, prev/next nav (mapped
  to Hugo's `PrevInSection`/`NextInSection` semantics: prev = newer,
  next = older, since posts sort newest-first), comments.
- **TOC** (`TableOfContents.astro`): built from Astro's own
  `render(entry)` heading extraction (no remark/rehype plugin needed —
  Astro's content pipeline already returns `headings`), gated on
  `toc: true` AND word count > 400, exactly like `toc.html`. `tocSticky`
  toggles the `.toc-sticky` CSS class (`position: sticky` ≥992px).
- **Blog sidebar** (`BlogSidebar.astro`): recent posts (count from
  `siteConfig.blog.recentPostCount`) + tag list with counts, gated by
  `siteConfig.blog.showRecentPosts`/`showTags` — mirrors
  `blog-sidebar.html`'s `showCategories`/`showRecentPosts` params.
- **Related posts** (`RelatedPosts.astro` + `getRelatedPosts()` in
  `lib/blog.ts`): same-tag posts, most recent first, excludes self, capped
  at 3 — a plain shared-tag filter, since Hugo's `.Related` engine
  (tags-weighted + date-weighted scoring) has no Astro built-in
  equivalent and a bespoke scoring reimplementation wasn't justified for
  a 4-post demo corpus.
- **Social sharing** (`SocialSharing.astro`): Twitter/LinkedIn/
  Facebook/Email on by default, Bluesky/Mastodon opt-in — matches Hugo's
  `params.sharing` on/off-by-default split exactly. `siteConfig.sharing`
  is the config surface.
- **Comments** (`Comments.astro`): disqus/giscus/utterances via
  `siteConfig.comments`, same shape as Hugo's `params.comments`. Enabled
  by default with demo `giscus` values (repo `zetxek/adritian-astro`) so
  the build produces visible evidence of the integration — same "demo
  config, not a real integration" precedent as Phase 3's newsletter
  `formAction: '/'`.
- **Reading progress** (`ReadingProgress.astro`): fixed bar + bundled
  `<script>` (not `is:inline`, since it doesn't need to run before first
  paint) tracking scroll against `#main-content`'s bounding rect,
  rAF-throttled — same approach as `reading-progress.html`, added only to
  the blog single-post page rather than site-wide (Hugo's version
  self-guards to `Type == "blog"` pages anyway).
- **Tags**: `/blog/tags/` (all tags, pill list with counts) and
  `/blog/tags/<tag>/` (posts for one tag + sidebar) per locale, mirroring
  `_default/taxonomy.html`/`terms.html`'s tag-taxonomy behavior. Author/
  series taxonomies were not ported — the theme's exampleSite blog corpus
  doesn't meaningfully exercise them and they weren't in scope.
- **i18n**: ~30 new keys added to `en.yaml`/`es.yaml` (blog/sharing/toc/
  comments/pagination strings), reusing Hugo's exact key names from
  `i18n/en.yaml`/`es.yaml` where they exist. Added `pagination_previous`/
  `pagination_next` (Hugo hardcodes these as English ARIA labels, not
  i18n keys — an improvement, not a literal port, consistent with Phase
  3's contact-key precedent).
- **New shared module**: `src/lib/blog.ts` — not called out in
  CONVENTIONS.md's file layout, added because the blog feature needed
  cross-page logic (pagination, reading time, related-post scoring, tag
  counting) that doesn't belong in a single component or in
  `i18n/mergeContent.ts`.

## Validation done
- `npm run build` exits 0, 28 pages generated.
- `dist/en/blog/index.html` and `dist/es/blog/index.html` both render 3
  post cards (pagerSize) with `type="image/webp"` `<picture>` sources.
- `dist/en/blog/page/2/index.html` and `dist/es/blog/page/2/index.html`
  exist (4 posts, pageSize 3 → 2 pages).
- 3 single post pages build per locale beyond page 1's cards (4 total:
  `color-schemes`, `getting-started`, `icons`, `seo-features`), each
  showing sidebar-free article body with sharing (`share-btn--twitter`
  present), related posts (`related-post-card` × 3 on `getting-started`,
  since all 4 demo posts share the `adritian` tag), comments
  (`giscus.app` script tag present), and reading-progress markup
  (`reading-progress-bar`).
- `color-schemes` (the only `toc: true` + >400-word post) renders
  `table-of-contents`; `icons` (`toc` unset) does not — confirms the
  word-count/flag gating works both ways.
- `/en/blog/tags/` and `/en/blog/tags/<tag>/` (`adritian`, `guide`,
  `customization`, `seo`, `icons`) build for both locales.
- ES blog list/post pages show Spanish strings (grepped "Publicado el" on
  `dist/es/blog/getting-started/index.html`); ES fallback badge
  (`en (fallback)`) appears 3× on `/es/blog/` (all posts on page 1, since
  no ES blog content exists in the Hugo exampleSite either) and 0× on
  `/en/blog/`.
- Header nav now includes a "Blog"/"Blog" link per locale
  (`siteConfig.headerMenu`), pointing at `/en/blog/`/`/es/blog/`.
- No leftover Hugo shortcode syntax (`{{<`) or `undefined` strings in
  built blog HTML.

## Deviations from a literal Hugo port
- **Pagination URLs are hand-rolled, not Astro's `paginate()` rest-route**
  — avoids route-priority ambiguity between a catch-all pagination route
  and the sibling `tags/`/`[slug]/` static and dynamic routes under the
  same `blog/` directory. Same URL shape as Hugo (`/blog/`, `/blog/page/2/`).
- **Related posts use a plain shared-tag filter**, not Hugo's `.Related`
  built-in (tags=100/date=10 weighted scoring, threshold 80) — no Astro
  equivalent exists, and with only 4 demo posts a bespoke scoring port
  wasn't worth the complexity.
- **Social sharing buttons are colored text pills, not brand SVG icons**
  — same simplification precedent as Phase 3's testimonial quote icon;
  brand colors (Twitter `#1DA1F2`, LinkedIn `#0077B5`, etc.) are preserved
  as background colors even without the logos.
- **No author/series taxonomy pages** — only tags, since none of the 4
  ported posts use `authors`/`series` frontmatter and the Hugo
  `_default/terms.html` author-resolution logic (multi-layer fallback
  through taxonomy → frontmatter string/slice → content lookup) is
  substantially more complex than this phase's scope justified.
- **Comments default to `enabled: true` with placeholder giscus values**
  (not a real repo integration) purely so the build has visible evidence
  of the comments component — same spirit as Phase 3's demo
  `formAction`/`newsletter` values.
- **`content-browser` prev/next nav is a single shared `<aside>`**, not
  split left/right columns like Hugo's Bootstrap grid — a plain flexbox
  `justify-content: space-between`, functionally identical.

## What remains for Phase 5 (SEO/extras)
- No JSON-LD structured data (`WebSite`/`BlogPosting` schema), hreflang
  alternate links, or per-page OG/Twitter-card image generation — Phase 4
  focused on the reader-facing blog feature, not the SEO layer
  `seo-features.md` (one of the ported posts) documents.
- RSS/Atom feed for the blog section (Hugo's exampleSite config enables
  `home = ["HTML", "RSS", "JSON"]` and `section = ["HTML", "RSS"]`) is not
  ported.
- Author/series taxonomy pages (see deviation above).
- `sample.md`/`sample-3.md`/`new-icons.md` and the various
  `pagination-test-*`/`test-image-*` fixture posts were intentionally not
  ported — they're theme test fixtures, not real demo content.

# Phase 6 — i18n completion: all 14 locales + RTL (status: Tasks 1-2 done)

## Task 1 — scalable locale routing
`src/pages/en/*` and `src/pages/es/*` (18 files, hand-duplicated per
locale) replaced with `src/pages/[locale]/*` (9 files), `getStaticPaths`
driven by `locales` from `src/i18n/index.ts`. Directory depth under
`src/pages/` is unchanged (`en/` and `[locale]/` are both one segment), so
every relative import (`../../layouts/Layout.astro`, etc.) needed no path
changes — only the hardcoded `const locale = 'en'` lines became
`Astro.params.locale`. Nested dynamic routes (`blog/[slug]`,
`blog/page/[page]`, `blog/tags/[tag]`) now loop `for (const locale of
locales)` inside `getStaticPaths` to produce the cross-product of
locale × slug/page/tag params.

**Validation**: `diff -rq` between the pre-refactor `dist/` and the
post-refactor `dist/` is byte-identical (same 30 files, same content) —
not just "same page count", the actual HTML/RSS/JSON output is unchanged.

## Task 2 — all 14 locales
- Ported Hugo's `i18n/{ar,da,de,fr,he,it,ko,nl,no,pl,pt,sv}.yaml` into
  `src/i18n/`. `en`/`es` were already done in Phase 1-3 with additional
  invented keys (blog/search/contact-placeholder strings that don't exist
  in Hugo at all — see Phase 3/4 deviations) and, for `es` only,
  hand-translated values for those invented keys.
- **Key reconciliation**: compared this port's `en.yaml` (96 keys) against
  Hugo's `en.yaml` (102 keys). 71 keys match by name 1:1 (Hugo's
  `contact_form_name`-style renames from Phase 3 are the port's own
  invention, not reconciled backward). For the 12 new locales, only these
  71 keys are populated — one script pass per locale, pulling the Hugo
  translation for each matching key and skipping empty/missing ones (they
  fall back to EN automatically via `useTranslations`, no invented
  translations).
- **Known gaps** (documented per instructions, not fixed):
  - `fr.yaml` in Hugo is far less complete than the other 11 — only 48/71
    keys have a French translation (missing all homepage section titles:
    `about_title`, `education_title`, `contact_title`,
    `newsletter_title`, etc. and the experience/newsletter button/label
    keys). `/fr/` correctly EN-falls-back for those; not a bug in this
    port, a gap in the upstream Hugo theme's own translation coverage.
  - All 12 new locales are missing 7 keys that are empty/unset even in
    Hugo's own `en.yaml` (`meta_title`, `logo_alt`, `head_title`,
    `head_description`, `experience_button_url`,
    `experience_button2_url`, `about_content`) — these are per-site
    content, not translatable UI strings, so EN fallback (or rather the
    port's own hardcoded EN content) is the correct behavior, matching
    Hugo's exampleSite pattern of leaving them blank in the base
    dictionary and filling them via shortcode params instead.
  - The 23 keys invented by this port (not present in any Hugo i18n file
    at all — `blog_title`, `blog_description`, `experience_title`,
    `contact_*_placeholder`, `extra_content_*`, `pagination_*`,
    `no_posts_found`, `tags_label`, `nav_search`, `prev_post`/`next_post`,
    `skills_years`, `fallback_notice`/`experience_fallback_notice`) are
    English-only for all 12 new locales (same as they'd be for any locale
    without Phase 3/4's manual Spanish additions) — no invented
    translations were added, per this phase's explicit instruction.
- **Locale registration**: `src/i18n/index.ts` `locales` array and
  `astro.config.mjs`'s `i18n.locales` + `@astrojs/sitemap`'s `i18n.locales`
  map now list all 14 codes. Content collections need no changes —
  `getLocalizedCollection` already falls back to EN per-slug for any
  locale with no translated entries (proven in Phase 3/4 for `es`; the 12
  new locales exercise the exact same fallback path, now for 100% of their
  content since none has real translated content collections yet).
- **Language selector**: `LanguageSelector.astro`'s `labels` map now has
  all 14 native (endonym) names. Hugo's `exampleSite/hugo.toml` only
  registers `en`/`es`/`fr`/`ar`/`he` as active `[languages.*]` entries with
  a `label` field; the other 9 locales have i18n dictionaries but no
  exampleSite language block, so their labels are the standard native
  names (Dansk, Deutsch, Italiano, 한국어, Nederlands, Norsk, Polski,
  Português, Svenska) rather than a value copied from Hugo config.
- **hreflang**: `Layout.astro`'s existing `alternateLinks` logic (Phase 5)
  already mapped over the full `locales` list generically — no changes
  needed, it now emits 14 alternates + x-default automatically.

**Validation**: `npm run build` exits 0, 197 pages (14 locales × 14
pages + `/404.html`). Grepped `about_title` from each locale's own
`<locale>.yaml` against `dist/<locale>/index.html`: found exactly once
for all 13 locales that have the key in Hugo, 0 times (correct EN
fallback "Who am I?" found instead) for `fr`. `dist/en/index.html`
hreflang: 14 `hreflang="<locale>"` + 1 `x-default`. Language selector on
`dist/en/index.html`: 13 `.dropdown-item.choice` entries (all locales
except current) × 2 placements (header+footer).

## What remains for Task 3 (RTL) and Phase 7
- RTL (`dir="rtl"` for `he`, `bootstrap.rtl.min.css`, logical-property CSS
  audit) not yet done as of this checkpoint — see below/next commit.
- No demo/polish pass, no i18n catalog/coverage page — deferred to Phase 7

# Phase 8 — design-system parity fix (status: in progress)

Deployed review found the global design system (typography/colors/navbar/
experience interaction) was never fully ported from the Hugo theme's
`assets/scss/`, even though per-section CSS existed. This phase fixes that
against the Hugo theme repo as source of truth.

**Task 1 — theme-init**: `global.css`'s `body` color/bg previously relied
on Bootstrap's own `body { color: var(--bs-body-color) }` rule to read our
theme custom properties. Replaced with an explicit, unconditional `body {
color: var(--bs-body-color); background-color: var(--bs-body-bg) }` so
correctness doesn't depend on Bootstrap's internal CSS. (The reported
"white text on white background" bug did not reproduce on `main` at the
start of this phase — light mode already measured `rgb(0,0,0)` on
`rgb(255,255,255)` — but the fix is still applied for exact source-of-truth
parity and defense against future Bootstrap upgrades.)

**Task 2 — typography**: Ported the Helvetica font stack, the h1-h6/
`.display-1` size-and-weight scale (`.display-1` renders 36px/800 mobile,
60px/800 desktop — used by the homepage hero `<h1 class="display-1">`),
`.btn`/`.btn-primary`/`.btn-frameless` (14px/700, black-on-white ⇄
white-on-black hover swap, inverted in dark mode), and `.contact h1-h6 {
color: black }` (with a dark-mode counterpart) from `_raditian.scss` /
`adritian.scss`. Link colors and footer text color were already correctly
ported in an earlier phase.

**Task 3 — navbar parity**: `siteConfig.headerMenu` (`src/config/site.ts`)
now has Hugo's 8-item `exampleSite/hugo.toml` `[[menus.header]]` set (Home,
About, Skills, Portfolio, Showcase, How-to, email/Contact icon, search
icon) instead of an ad-hoc 4-item list. Deviations from Hugo, both because
this port has no standalone `/skills` or `/showcase` page (they're
homepage-only sections, per Phase 3's NOTE.md decision):
  - "Skills" links to `#skills-section` instead of `/skills`.
  - "Showcase" links to `#showcase` instead of `/showcase`.
  - The email/search nav items use inline SVG icons + a visually-hidden
    label, not Hugo's `icon-email`/`icon-search` icon-font glyphs — the
    Adritian icon font (`static/fonts/adritian-icons.woff*`) was never
    ported to this Astro build, and porting a whole icon font is out of
    scope for this phase. Flagging as a gap for a future phase if more
    icon-driven UI is ported.
  - `Header.astro` only computes `.active` for real page paths (`/`,
    `/blog/`, `/search/`) — the anchor items (About/Skills/Portfolio/
    Showcase/Contact) would need scroll-spy JS to know which section is
    in view, which is out of scope here.
  - `assets/js/navbar-overflow.js` (Hugo's "More" dropdown for overflowing
    nav items) was **not** ported in this pass — the header now has 8
    items instead of 4, which makes overflow at narrow desktop widths more
    likely. Deferred; flagging explicitly per this phase's brief.
  per the task brief.

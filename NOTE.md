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

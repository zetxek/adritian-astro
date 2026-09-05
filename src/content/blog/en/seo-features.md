---
title: 'SEO Features: Meta Descriptions, Hreflang, and Structured Data'
date: 2026-03-02T10:00:00+00:00
description: 'Learn how the Adritian theme handles SEO out of the box: per-page meta descriptions, hreflang alternate links for multilingual sites, and JSON-LD structured data for blog posts.'
tags:
  - adritian
  - guide
  - seo
---

The Adritian theme includes built-in SEO features that help search engines understand and properly index your content. This post covers what's available and how to get the most out of it.

## Per-Page Meta Descriptions

Every page on your site gets a unique `<meta name="description">` tag using this fallback chain:

1. **Page `description` front matter** (if set)
2. **Auto-generated page summary** (plainified and truncated to 155 characters)
3. **Site-wide fallback** from your i18n `head_description` string

To set a custom description for any page, add it to your front matter:

```yaml
---
title: 'My Blog Post'
description: 'A concise summary of what this post is about, ideally under 155 characters.'
---
```

If you don't set a `description`, the theme will automatically use a cleaned-up version of the page's content summary. This ensures that search engine results show relevant text for each page instead of a generic site-wide description.

## Hreflang Alternate Links

If your site is multilingual, the theme automatically generates `<link rel="alternate" hreflang="...">` tags for every translated page. These tell search engines which language versions are available, so users are served the correct one in search results.

For example, if you have a page translated into English and Spanish, the generated HTML will include:

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/blog/my-post/" />
<link rel="alternate" hreflang="es" href="https://example.com/es/blog/my-post/" />
```

This works automatically as long as translations are linked between pages.

## JSON-LD Structured Data

The theme generates [JSON-LD](https://json-ld.org/) structured data for search engines:

- **All pages** get `WebSite` schema with site name, description, and publisher info
- **Blog posts** additionally get `BlogPosting` schema with headline, dates, images, and author information

### Featured Images in Structured Data

Blog posts can include a featured image in the JSON-LD output. The theme checks these front matter fields in order:

1. `featuredImage`
2. `featured_image`
3. `images.featured_image` (map format)
4. `images` (first item if it's a list)
5. Site-level default image

```yaml
---
title: 'My Blog Post'
images:
  featured_image: '/img/blog/my-post.png'
---
```

## No Configuration Required

All of these SEO features work out of the box with sensible defaults. You don't need to configure anything for basic functionality — just write your content and the theme handles the rest.

/**
 * JSON-LD builders — Astro equivalent of layouts/partials/seo/jsonld.html and
 * seo/breadcrumbs-jsonld.html. Each builder returns a plain object; callers
 * pass the result(s) to Layout's `jsonLd` prop, which stringifies one
 * <script type="application/ld+json"> per entry (matching Hugo emitting one
 * <script> tag per schema object, not one array).
 */

import { siteConfig } from '../config/site';

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.baseURL).toString();
}

function personRef() {
  return {
    '@type': 'Person',
    name: siteConfig.seo.person.name,
    url: siteConfig.seo.person.url,
  };
}

/** WebSite + Person schema, emitted on every page (Hugo's jsonld.html runs unconditionally). */
export function buildSiteJsonLd(locale: string, description: string) {
  const webSite: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.title,
    url: siteConfig.baseURL,
    description,
    inLanguage: locale,
    publisher: personRef(),
  };
  if (siteConfig.seo.siteImage) {
    webSite.image = [absoluteUrl(siteConfig.seo.siteImage)];
  }

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.seo.person.name,
    url: siteConfig.seo.person.url,
    sameAs: siteConfig.seo.person.sameAs,
  };

  return [webSite, person];
}

export interface BlogPostingInput {
  title: string;
  description?: string;
  url: string;
  datePublished?: Date;
  dateModified?: Date;
  image?: string;
}

/** BlogPosting schema for a single blog post page. */
export function buildBlogPostingJsonLd(input: BlogPostingInput) {
  const blogPosting: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    url: input.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    author: personRef(),
    publisher: personRef(),
  };
  if (input.description) blogPosting.description = input.description;
  if (input.datePublished) blogPosting.datePublished = input.datePublished.toISOString();
  if (input.dateModified) blogPosting.dateModified = input.dateModified.toISOString();
  if (input.image) blogPosting.image = [input.image];
  return blogPosting;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/** BreadcrumbList schema — items are Home..current, in order (position assigned here). */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

import type { CollectionEntry } from 'astro:content';
import { getLocalizedCollection, type LocalizedEntry } from '../i18n/mergeContent';

export type BlogEntry = LocalizedEntry<'blog'>;

/** Slug without the leading "<locale>/" segment, e.g. "en/color-schemes" -> "color-schemes". */
export function slugOf(entry: CollectionEntry<'blog'>): string {
  return entry.id.split('/').slice(1).join('/');
}

/** All non-draft posts for `locale`, EN-fallback applied, newest first — mirrors Hugo's `where .Draft false | .ByDate desc`. */
export async function getSortedBlogPosts(locale: string): Promise<BlogEntry[]> {
  const localized = await getLocalizedCollection('blog', locale);
  return localized
    .filter(({ entry }) => !entry.data.draft)
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());
}

/** Approximates Hugo's `.WordCount` from the raw markdown body. */
export function wordCount(entry: CollectionEntry<'blog'>): number {
  return entry.body?.trim().split(/\s+/).filter(Boolean).length ?? 0;
}

/** Mirrors `blog/single.html`'s inline `div .WordCount 200` (minimum 1 minute). */
export function readingTimeMinutes(entry: CollectionEntry<'blog'>): number {
  return Math.max(1, Math.round(wordCount(entry) / 200));
}

/** Mirrors `toc.html`'s gating: only show a TOC when requested and the post is long enough. */
export function shouldShowToc(entry: CollectionEntry<'blog'>): boolean {
  return entry.data.toc === true && wordCount(entry) > 400;
}

/** Same-tag posts, most recent first, excluding the current post — replicates related-posts.html's intent without Hugo's built-in `.Related` engine. */
export function getRelatedPosts(current: CollectionEntry<'blog'>, all: BlogEntry[], cap = 3): BlogEntry[] {
  const currentSlug = slugOf(current);
  const tags = new Set(current.data.tags);
  return all
    .filter(({ entry }) => slugOf(entry) !== currentSlug && entry.data.tags.some((tag) => tags.has(tag)))
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf())
    .slice(0, cap);
}

/** Tag -> post count, sorted most-used first — feeds blog-sidebar.html's tag list. */
export function getTagCounts(posts: BlogEntry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const { entry } of posts) {
    for (const tag of entry.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
}

export interface Page<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
  baseUrl: string;
  url: { current: string; prev?: string; next?: string };
}

/** Page-1-relative link for page `n` — page 1 lives at `baseUrl`, later pages at `<baseUrl>page/<n>/`. */
export function pageUrl(baseUrl: string, n: number): string {
  return n <= 1 ? baseUrl : `${baseUrl}page/${n}/`;
}

/**
 * Hand-rolled pagination (no Astro `paginate()` rest-route) so page 1 lives
 * at `<baseUrl>` and later pages at `<baseUrl>page/<n>/`, matching Hugo's
 * `_internal/pagination.html` URL scheme.
 */
export function paginate<T>(
  items: T[],
  { pageSize, currentPage, baseUrl }: { pageSize: number; currentPage: number; baseUrl: string },
): Page<T> {
  const lastPage = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    currentPage,
    lastPage,
    total: items.length,
    baseUrl,
    url: {
      current: pageUrl(baseUrl, currentPage),
      prev: currentPage > 1 ? pageUrl(baseUrl, currentPage - 1) : undefined,
      next: currentPage < lastPage ? pageUrl(baseUrl, currentPage + 1) : undefined,
    },
  };
}

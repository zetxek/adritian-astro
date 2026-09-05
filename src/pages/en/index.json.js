import { getSortedBlogPosts, slugOf } from '../../lib/blog';

const locale = 'en';

/**
 * Build-time search index — ports layouts/_default/index.json. Scoped to
 * blog posts (the only collection with body text and a standalone,
 * linkable per-entry page); see NOTE.md (Phase 5) for the full rationale.
 */
export async function GET() {
  const posts = await getSortedBlogPosts(locale);
  const index = posts.map(({ entry }) => ({
    title: entry.data.title,
    description: entry.data.description,
    tags: entry.data.tags,
    url: `/${locale}/blog/${slugOf(entry)}/`,
    locale,
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}

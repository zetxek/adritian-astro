import rss from '@astrojs/rss';
import { siteConfig } from '../../config/site';
import { getSortedBlogPosts, slugOf } from '../../lib/blog';

const locale = 'es';

export async function GET(context) {
  const posts = await getSortedBlogPosts(locale);
  return rss({
    title: `${siteConfig.title} Blog`,
    description: siteConfig.description,
    site: context.site ?? siteConfig.baseURL,
    items: posts.map(({ entry }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/${locale}/blog/${slugOf(entry)}/`,
      categories: entry.data.tags,
    })),
    customData: `<language>${locale}</language>`,
  });
}

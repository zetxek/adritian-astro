import rss from '@astrojs/rss';
import { siteConfig } from '../../config/site';
import { getSortedBlogPosts, slugOf } from '../../lib/blog';
import { locales } from '../../i18n';

export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export async function GET(context) {
  const { locale } = context.params;
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

// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Keep in sync with siteConfig.baseURL (src/config/site.ts) — needed here
  // too since @astrojs/sitemap and @astrojs/rss resolve absolute URLs from
  // this build-time value, not from the runtime config object.
  site: 'https://adritian-astro.vercel.app/',
  redirects: {
    '/': '/en/',
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
        },
      },
    }),
  ],
});

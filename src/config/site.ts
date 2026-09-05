/**
 * Typed "ambient config" — the Astro equivalent of the [params] surface in
 * hugo.toml / exampleSite/hugo.toml. Components read from this object the
 * way Hugo templates read `.Site.Params.*`.
 */

export interface NavLink {
  name: string;
  url: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  baseURL: string;
  author: {
    name: string;
    url: string;
  };
  logo: {
    text1: string;
    text2: string;
  };
  social: {
    label: string;
    url: string;
  }[];
  /** Per-locale footer notice, matches Hugo's languages.<lang>.params.footer.notice */
  footerNotice: Record<string, string>;
  /** Per-locale header nav links, matches Hugo's languages.<lang>.menus.header */
  headerMenu: Record<string, NavLink[]>;
  /** Section toggles — which homepage sections are enabled, and in what
   * order pages/en(or es)/index.astro renders them. Phase 1 built `experience`;
   * Phase 2 added `about`, `showcase`, `clientAndWork`, and `extraContent`
   * (a plain text-section demo block); Phase 3 adds `skills`, `education`,
   * `testimonial`, `contact`, `newsletter`. */
  sections: {
    about: boolean;
    showcase: boolean;
    experience: boolean;
    skills: boolean;
    education: boolean;
    clientAndWork: boolean;
    testimonial: boolean;
    contact: boolean;
    newsletter: boolean;
    extraContent: boolean;
  };
  experience: {
    /** Matches Hugo's params.homepageExperienceCount */
    homepageCount: number;
  };
  /** Social/platform icon links, rendered by PlatformLinks. `icon` selects
   * an inline SVG from PlatformLinks' icon map. */
  platformLinks: {
    icon: string;
    label: string;
    url: string;
  }[];
  about: {
    buttonUrl: string;
  };
  /** Formspree-style contact form config, matches Hugo's contact-section
   * shortcode params (`form_action`/`form_method`) in footer.md. `info` is
   * per-locale HTML (rendered with set:html, like showcase's description)
   * since it mirrors Hugo's `| safeHTML`-piped phone/email/location params. */
  contact: {
    formAction: string;
    formMethod: string;
    messageRows: number;
    info: Record<string, { phone: string; email: string; location: string }>;
  };
  /** Matches Hugo's newsletter-section shortcode params. The exampleSite
   * doesn't wire a real ESP — `formAction: '/'` posts to the current page,
   * same as the Hugo demo. */
  newsletter: {
    formAction: string;
    formMethod: string;
  };
  /** Matches Hugo's `params.blog` surface (layouts/blog/list.html,
   * blog-sidebar.html). */
  blog: {
    /** Hugo's [pagination].pagerSize in exampleSite/hugo.toml. */
    pagerSize: number;
    showRecentPosts: boolean;
    recentPostCount: number;
    showTags: boolean;
  };
  /** Matches Hugo's `params.sharing` surface (social-sharing.html). Twitter/
   * LinkedIn/Facebook/Email default on (Hugo shows them unless explicitly
   * set false); Bluesky/Mastodon default off (Hugo only shows them if
   * explicitly set true). */
  sharing: {
    twitter: boolean;
    linkedin: boolean;
    facebook: boolean;
    email: boolean;
    bluesky: boolean;
    mastodon: boolean;
  };
  /** Matches Hugo's `params.comments` surface (comments.html). */
  comments: {
    enabled: boolean;
    provider: 'disqus' | 'giscus' | 'utterances';
    disqusShortname?: string;
    giscus?: {
      repo: string;
      repoId: string;
      category: string;
      categoryId: string;
      mapping?: string;
      theme?: string;
    };
    utterances?: {
      repo: string;
      issueTerm?: string;
      theme?: string;
    };
  };
  /** Matches Hugo's `params.seo` surface (seo/jsonld.html) — feeds the
   * site-wide WebSite/Person JSON-LD emitted on every page. */
  seo: {
    /** Absolute-from-root path to the site's default OG/JSON-LD image. */
    siteImage: string;
    person: {
      name: string;
      url: string;
      sameAs: string[];
    };
  };
}

export const siteConfig: SiteConfig = {
  title: 'Adritian',
  description: 'Astro port of the Adritian Hugo theme.',
  baseURL: 'https://adritian-astro.vercel.app/',
  author: {
    name: 'Adrián Moreno Peña',
    url: 'https://www.adrianmoreno.info',
  },
  logo: {
    text1: 'Adritian',
    text2: '',
  },
  social: [
    { label: 'GitHub', url: 'https://github.com/zetxek' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/adrianmoreno' },
  ],
  footerNotice: {
    en: '© Adritian. Astro port by Adrián Moreno Peña.',
    es: '© Adritian. Versión en Astro por Adrián Moreno Peña.',
  },
  headerMenu: {
    en: [
      { name: 'Home', url: '/en/' },
      { name: 'Experience', url: '/en/experience/' },
      { name: 'Blog', url: '/en/blog/' },
    ],
    es: [
      { name: 'Inicio', url: '/es/' },
      { name: 'Experiencia', url: '/es/experience/' },
      { name: 'Blog', url: '/es/blog/' },
    ],
  },
  sections: {
    about: true,
    showcase: true,
    experience: true,
    skills: true,
    education: true,
    clientAndWork: true,
    testimonial: true,
    contact: true,
    newsletter: true,
    extraContent: true,
  },
  experience: {
    homepageCount: 6,
  },
  platformLinks: [
    { icon: 'facebook', label: 'Facebook', url: 'https://facebook.com/yourpage' },
    { icon: 'x-twitter', label: 'X (Twitter)', url: 'https://twitter.com/zetxek' },
    { icon: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/adrianmoreno/' },
    { icon: 'github', label: 'GitHub', url: 'https://github.com/zetxek' },
    { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/zetxek/' },
    { icon: 'youtube', label: 'YouTube', url: 'https://youtube.com' },
  ],
  about: {
    buttonUrl: '/skills',
  },
  contact: {
    formAction: 'https://formspree.io/f/mail@example.com',
    formMethod: 'POST',
    messageRows: 3,
    info: {
      en: {
        phone: "<a href='tel:+555666777'>555 666 777</a>",
        email: "<a href='mailto:demo@demosite.com'>demo@demosite.com</a>",
        location: '🇩🇰 Denmark',
      },
      es: {
        phone: "<a href='tel:+555666777'>555 666 777</a>",
        email: "<a href='mailto:demo@demosite.com'>demo@demosite.com</a>",
        location: '🇩🇰 Dinamarca',
      },
    },
  },
  newsletter: {
    formAction: '/',
    formMethod: 'POST',
  },
  blog: {
    pagerSize: 3,
    showRecentPosts: true,
    recentPostCount: 5,
    showTags: true,
  },
  sharing: {
    twitter: true,
    linkedin: true,
    facebook: true,
    email: true,
    bluesky: false,
    mastodon: false,
  },
  comments: {
    enabled: true,
    provider: 'giscus',
    giscus: {
      repo: 'zetxek/adritian-astro',
      repoId: 'R_demo',
      category: 'General',
      categoryId: 'DIC_demo',
      mapping: 'pathname',
      theme: 'preferred_color_scheme',
    },
  },
  seo: {
    siteImage: '/images/og-img.png',
    person: {
      name: 'Adrián Moreno Peña',
      url: 'https://www.adrianmoreno.info',
      sameAs: ['https://github.com/zetxek'],
    },
  },
};

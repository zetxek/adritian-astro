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
    ],
    es: [
      { name: 'Inicio', url: '/es/' },
      { name: 'Experiencia', url: '/es/experience/' },
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
};

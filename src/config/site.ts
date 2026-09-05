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
  /** Section toggles — which homepage sections are enabled. Only `experience`
   * is built in Phase 1; the rest are placeholders for later phases. */
  sections: {
    experience: boolean;
    showcase: boolean;
    about: boolean;
    education: boolean;
    clientAndWork: boolean;
    testimonial: boolean;
    contact: boolean;
    newsletter: boolean;
  };
  experience: {
    /** Matches Hugo's params.homepageExperienceCount */
    homepageCount: number;
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
    experience: true,
    showcase: false,
    about: false,
    education: false,
    clientAndWork: false,
    testimonial: false,
    contact: false,
    newsletter: false,
  },
  experience: {
    homepageCount: 6,
  },
};

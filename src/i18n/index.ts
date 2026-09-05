import yaml from 'js-yaml';
import en from './en.yaml?raw';
import es from './es.yaml?raw';

export const locales = ['en', 'es'];
export const defaultLocale = 'en';

const dictionaries: Record<string, Record<string, string>> = {
  en: yaml.load(en) as Record<string, string>,
  es: yaml.load(es) as Record<string, string>,
};

/**
 * Mirrors Hugo's `i18n "key"` lookup: reads from the requested locale's
 * dictionary and falls back to the default locale (en) for missing keys,
 * matching Hugo's translation-fallback behavior for i18n strings.
 */
export function useTranslations(locale: string) {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
  return (key: string) => dict[key] ?? dictionaries[defaultLocale][key] ?? key;
}

/**
 * Swaps the locale segment of a path built under prefixDefaultLocale
 * routing, e.g. "/en/experience/" + "es" -> "/es/experience/".
 */
export function switchLocalePath(pathname: string, targetLocale: string): string {
  const segments = pathname.split('/').filter(Boolean);
  segments[0] = targetLocale;
  return `/${segments.join('/')}/`;
}

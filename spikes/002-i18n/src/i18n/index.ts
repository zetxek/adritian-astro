import yaml from 'js-yaml';
import en from './en.yaml?raw';
import es from './es.yaml?raw';

export const locales = ['en', 'es'];
export const defaultLocale = 'en';

const dictionaries = {
  en: yaml.load(en),
  es: yaml.load(es),
};

/**
 * Mirrors Hugo's `i18n "key"` lookup: reads from the requested locale's
 * dictionary and falls back to the default locale (en) for missing keys,
 * matching Hugo's translation-fallback behavior for i18n strings.
 */
export function useTranslations(locale) {
  const dict = dictionaries[locale] ?? dictionaries[defaultLocale];
  return (key) => dict[key] ?? dictionaries[defaultLocale][key] ?? key;
}

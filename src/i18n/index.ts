import yaml from 'js-yaml';
import en from './en.yaml?raw';
import es from './es.yaml?raw';
import ar from './ar.yaml?raw';
import da from './da.yaml?raw';
import de from './de.yaml?raw';
import fr from './fr.yaml?raw';
import he from './he.yaml?raw';
import it from './it.yaml?raw';
import ko from './ko.yaml?raw';
import nl from './nl.yaml?raw';
import no from './no.yaml?raw';
import pl from './pl.yaml?raw';
import pt from './pt.yaml?raw';
import sv from './sv.yaml?raw';

// Locale codes match Hugo's i18n/*.yaml file names (exampleSite/hugo.toml's
// `[languages]` table would carry the same set for a full Hugo port).
export const locales = ['ar', 'da', 'de', 'en', 'es', 'fr', 'he', 'it', 'ko', 'nl', 'no', 'pl', 'pt', 'sv'];
export const defaultLocale = 'en';

/** Locales that read right-to-left. */
export const rtlLocales = ['ar', 'he'];

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale);
}

const rawDictionaries: Record<string, string> = { en, es, ar, da, de, fr, he, it, ko, nl, no, pl, pt, sv };

const dictionaries: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(rawDictionaries).map(([locale, raw]) => [locale, yaml.load(raw) as Record<string, string>]),
);

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

import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale } from './index';

export interface LocalizedEntry<C extends 'experience'> {
  entry: CollectionEntry<C>;
  /** true when this entry came from defaultLocale because `locale` has no translation for it */
  isFallback: boolean;
}

/**
 * Replicates Hugo's `lang.Merge`: returns every entry of `collection` for
 * `locale`, and for any slug that has no translation in `locale`, falls
 * back to the `defaultLocale` version instead of omitting it.
 *
 * Entry ids are expected to be "<locale>/<slug>" (from the glob loader
 * walking locale subfolders), e.g. "en/job-1" and "es/job-1".
 */
export async function getLocalizedCollection<C extends 'experience'>(
  collection: C,
  locale: string,
): Promise<LocalizedEntry<C>[]> {
  const all = await getCollection(collection);

  const bySlug = new Map<string, LocalizedEntry<C>>();

  // 1. Seed with the default locale — this is the fallback layer.
  for (const entry of all) {
    const [entryLocale, ...slugParts] = entry.id.split('/');
    if (entryLocale === defaultLocale) {
      bySlug.set(slugParts.join('/'), { entry, isFallback: locale !== defaultLocale });
    }
  }

  // 2. Overlay with the requested locale's translations, when present.
  if (locale !== defaultLocale) {
    for (const entry of all) {
      const [entryLocale, ...slugParts] = entry.id.split('/');
      if (entryLocale === locale) {
        bySlug.set(slugParts.join('/'), { entry, isFallback: false });
      }
    }
  }

  return [...bySlug.values()];
}

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const experience = defineCollection({
  // id is "<locale>/<slug>", e.g. "en/job-1" or "es/job-1"
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      title: z.string(),
      jobTitle: z.string(),
      company: z.string(),
      location: z.string(),
      duration: z.string(),
      companyLogo: image().optional(),
    }),
});

// Singleton per-locale content for the showcase hero section. id is
// "<locale>/index", e.g. "en/index" or "es/index".
const showcase = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/showcase' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string(),
      description: z.string(),
      buttonText: z.string(),
      buttonUrl: z.string(),
      image: image().optional(),
    }),
});

// id is "<locale>/<slug>", e.g. "en/goldline". No ES entries yet — falls
// back to EN via getLocalizedCollection.
const clients = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clients' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      title: z.string(),
      link: z.string(),
      logo: image(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      title: z.string(),
      link: z.string(),
      buttonText: z.string(),
      buttonUrl: z.string(),
      image: image(),
    }),
});

export const collections = { experience, showcase, clients, projects };

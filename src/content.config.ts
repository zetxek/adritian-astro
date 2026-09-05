import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    jobTitle: z.string(),
    company: z.string(),
    location: z.string(),
    duration: z.string(),
    companyLogo: z.string().optional(),
  }),
});

export const collections = { experience };

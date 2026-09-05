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

// id is "<locale>/<slug>". No ES entries in the Hugo exampleSite either —
// falls back to EN via getLocalizedCollection.
const education = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/education' }),
  schema: z.object({
    order: z.number(),
    year: z.string(),
    university: z.string(),
    degree: z.string(),
  }),
});

// Singleton per-locale content (like `showcase`) for the /skills data, id
// is "<locale>/index".
const skills = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/skills' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    categories: z.array(
      z.object({
        name: z.string(),
        skills: z.array(
          z.object({
            name: z.string(),
            level: z.number(),
            years: z.string(),
            description: z.string(),
          })
        ),
      })
    ),
  }),
});

// id is "<locale>/<slug>". No ES entries in the Hugo exampleSite either —
// falls back to EN via getLocalizedCollection.
const testimonial = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonial' }),
  schema: ({ image }) =>
    z.object({
      date: z.coerce.date(),
      name: z.string(),
      position: z.string(),
      image: image(),
    }),
});

export const collections = { experience, showcase, clients, projects, education, skills, testimonial };

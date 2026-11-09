import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Content language, drives `<html lang>` and `og:locale`. */
    lang: z.enum(['en', 'fr']).default('en'),
    /** Path or absolute URL to the article's social preview image. */
    image: z.string().optional(),
    /** Alt text for the social preview image; falls back to the description. */
    imageAlt: z.string().optional(),
    /** Short note shown under the image, e.g. to disclose how it was produced. */
    imageHint: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const sections = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/sections' }),
  schema: z.object({
    title: z.string(),
    hint: z.string().optional(),
    order: z.number().default(0),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    label: z.string().optional(),
    /** Explained on hover/focus of the label badge. */
    labelHint: z.string().optional(),
    headline: z.string(),
    url: z.url().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const career = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/career' }),
  schema: z.object({
    company: z.string(),
    logo: z.string().optional(),
    url: z.url().optional(),
    role: z.string(),
    period: z.string(),
    headline: z.string(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, sections, projects, career };

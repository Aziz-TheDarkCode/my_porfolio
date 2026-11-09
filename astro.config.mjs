// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://abdouaziz.dev',
  integrations: [
    mdx(),
    sitemap({
      // Utility page, intentionally kept out of search results.
      filter: (page) => !page.includes('/style-guide'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['marbled-botanical-smell.ngrok-free.dev', '.ngrok-free.dev'],
    },
  },
});

// ComputerPOS Pro - Astro Configuration
// Optimized for Cloudflare Pages deployment

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  // Static site generation for Cloudflare Pages
  output: 'static',

  // Site configuration
  site: 'https://pos-frontend.pages.dev',

  // Integrations
  integrations: [
    react(),
    tailwind()
  ],

  // Vite configuration
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }
  }
});
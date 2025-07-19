// ComputerPOS Pro - Astro Configuration with Authentication Support
// Optimized for Cloudflare Pages deployment with SSR

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  // FULL SERVER-SIDE RENDERING - No JavaScript Required
  output: 'server',

  // Site configuration
  site: 'https://pos-frontend.pages.dev',

  // Cloudflare adapter for full SSR
  adapter: cloudflare({
    mode: 'advanced',
    functionPerRoute: false,
    runtime: {
      mode: 'local',
      type: 'pages'
    }
  }),

  // Integrations
  integrations: [
    react(),
    tailwind()
  ],

  // Vite configuration
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.API_URL': JSON.stringify('https://computerpos-api.bangachieu2.workers.dev')
    }
  }
});
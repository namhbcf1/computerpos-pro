import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [
    react({
      include: ['**/react/*', '**/components/**/*.tsx', '**/components/**/*.jsx']
    }),
    tailwind()
  ],
  vite: {
    define: {
      'process.env': process.env
    },
    ssr: {
      external: ['react', 'react-dom']
    }
  },
  // Security headers
  security: {
    checkOrigin: true
  }
});
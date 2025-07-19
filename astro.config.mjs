// ComputerPOS Pro - Enhanced Astro Configuration 2026
// Optimized for Cloudflare deployment with hybrid rendering and AI features

import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  // Hybrid rendering: Static by default, SSR when needed
  output: 'hybrid',

  // Site configuration for SEO
  site: 'https://computerpos.pro',
  base: '/',
  trailingSlash: 'ignore',

  // Enhanced Cloudflare adapter
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: 'wrangler.toml',
      experimentalJsonConfig: true
    },
    runtime: {
      mode: 'advanced',
      type: 'pages'
    },
    routes: {
      strategy: 'auto',
      include: ['/api/*', '/pos/*', '/admin/*'],
      exclude: ['/assets/*', '/images/*', '/_astro/*']
    }
  }),

  // Enhanced integrations
  integrations: [
    // React for interactive islands
    react({
      include: ['**/islands/**', '**/components/islands/**'],
      experimentalReactChildren: true
    }),

    // Tailwind CSS with optimization
    tailwind({
      applyBaseStyles: false,
      configFile: './tailwind.config.mjs'
    }),

    // MDX for documentation
    mdx({
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'github-dark',
        wrap: true
      },
      gfm: true
    }),

    // Sitemap for SEO
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'vi',
        locales: {
          vi: 'vi-VN',
          en: 'en-US'
        }
      }
    })
  ],

  // Enhanced Vite configuration
  vite: {
    // SSR optimization
    ssr: {
      noExternal: [
        'date-fns',
        'lodash-es',
        '@cloudflare/ai',
        'recharts'
      ],
      external: [
        'node:crypto',
        'node:buffer',
        'node:stream'
      ]
    },

    // Build optimization
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-charts': ['recharts'],
            'vendor-utils': ['date-fns', 'lodash-es']
          }
        }
      }
    },

    // Environment variables
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      __VERSION__: JSON.stringify('2.0.0'),
      'process.env': process.env
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'date-fns',
        'recharts'
      ],
      exclude: [
        '@cloudflare/ai'
      ]
    }
  },

  // Build configuration
  build: {
    format: 'directory',
    assets: 'assets',
    inlineStylesheets: 'auto',
    split: true
  },

  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    domains: ['computerpos.pro'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflare.com'
      }
    ]
  },

  // Security configuration
  security: {
    checkOrigin: true
  },

  // Prefetch configuration
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover'
  },

  // Internationalization
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: true
    },
    fallback: {
      en: 'vi'
    }
  },

  // Experimental features for 2026
  experimental: {
    contentCollectionCache: true,
    clientPrerender: true,
    globalRoutePriority: true
  },

  // Redirects for better UX
  redirects: {
    '/dashboard': '/pos/dashboard',
    '/login': '/pos/login',
    '/admin': '/pos/admin'
  }
});
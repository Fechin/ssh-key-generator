import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
      providerImportSource: '@mdx-js/react',
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon/favicon.ico', 'favicon/apple-touch-icon.png'],
      manifest: {
        name: 'SSH Key Generator',
        short_name: 'SSH Key Gen',
        description: 'Generate SSH keys securely in your browser. Support Ed25519, RSA. 100% client-side.',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Keep the offline tool without precaching every translated article HTML.
        globPatterns: ['**/*.{js,css,ico,png,webp,svg,woff2}', 'index.html'],
        // Guides ship as static HTML; their 210 MDX chunks need no install-time download.
        globIgnores: [
          'check-vps-ip',
          'what-is-ssh',
          'what-is-an-ssh-key',
          'ssh-command',
          'how-to-set-up-ssh',
          'generate-ssh-key',
          'ssh-keygen',
        ].map((slug) => `assets/${slug}-*.js`),
        // Other routes must receive their own static HTML and real HTTP status.
        // A denylist can silently turn new guide URLs or missing paths into home.
        navigateFallbackAllowlist: [/^\/$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  worker: {
    format: 'es'
  }
})

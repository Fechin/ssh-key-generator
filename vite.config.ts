import fs from 'node:fs'
import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const languageConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'src/i18n/languageConfig.json'), 'utf8'),
) as {
  languages: Array<{ basePath: string }>
}

const localeNavigationDenylist = [
  new RegExp(
    `^/(?:${languageConfig.languages
      .filter(({ basePath }) => basePath !== '')
      .map(({ basePath }) => escapeRegExp(basePath.slice(1)))
      .join('|')})(?:/.*)?$`,
  ),
  /^\/llms\.txt$/,
  /^\/\.well-known\/llms\.txt$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/(?:what-is-ssh|what-is-an-ssh-key|ssh-command|how-to-set-up-ssh)(?:\/.*)?$/,
]

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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SSH Key Generator',
        short_name: 'SSH Key Gen',
        description: 'Generate SSH keys securely in your browser. Support Ed25519, RSA. 100% client-side.',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: localeNavigationDenylist,
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

import { resolveConfig } from 'vite'

// Prerendering writes the final HTML after Vite's closeBundle hook. Reuse the
// plugin's resolved Workbox configuration so its revisions cover that HTML.
const config = await resolveConfig({}, 'build', 'production', 'production')
const pwa = config.plugins.find((plugin) => plugin.name === 'vite-plugin-pwa')

if (!pwa?.api || typeof pwa.api.generateSW !== 'function' || pwa.api.disabled) {
  throw new Error('The enabled Vite PWA plugin is required to finalize the service worker.')
}

await pwa.api.generateSW()

/// <reference types="node" />
import { prerenderToNodeStream } from 'react-dom/static'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { useLanguageStore } from './i18n/languageStore'
import { loadLanguage } from './i18n/useTranslation'
import type { Language } from './i18n/languageConfig'

// Render the same public UI for every visitor, without executing key generation.
export async function renderPage(pathname: string, language: Language): Promise<string> {
  await loadLanguage(language)
  useLanguageStore.setState({ language })

  const errors: unknown[] = []
  const page = <StaticRouter location={pathname}><App /></StaticRouter>
  const { prelude } = await prerenderToNodeStream(
    page,
    { onError(error) { errors.push(error) } },
  )
  if (errors.length) throw errors[0]
  await new Promise<void>((resolve, reject) => {
    prelude.on('end', resolve)
    prelude.on('error', reject)
    prelude.resume()
  })
  // All lazy modules are now resolved. Serialize in document order, without
  // streaming reveal scripts or hidden Suspense segments for non-JS readers.
  return renderToStaticMarkup(page)
}

export { buildSiteInfoPageMetadata as getSiteInfoMetadata } from './lib/seo'

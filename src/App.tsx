import siteInfo from '@/content/siteInfo.json'
import { SiteInfoPage } from '@/components/pages/SiteInfoPage'
import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Key, Terminal, Settings, BookOpen } from 'lucide-react'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { KeyGeneratorForm } from '@/components/key-generator/KeyGeneratorForm'
import { GitHubStarBadge } from '@/components/marketing/GitHubStarBadge'
import { useGitHubStars } from '@/hooks/useGitHubStars'
import { useTranslation } from '@/i18n'
import {
  DEFAULT_LANGUAGE,
  NON_DEFAULT_LANGUAGE_CONFIG,
  getLanguagePathname,
  useLanguageStore,
  syncLanguageFromPath,
  type Language,
} from '@/i18n'
import { buildHomePageMetadata, buildSiteInfoPageMetadata, syncPageMetadata } from '@/lib/seo'
import { ARTICLE_SLUGS, hasArticleTranslation, type ArticleSlug } from '@/content/articles'
import { useThemeStore } from '@/store/themeStore'
import type { KeyPair } from '@/types/keys'
import { trackToolEvent } from '@/lib/analytics'
import { getToolHref, parseToolMode } from '@/lib/toolNavigation'

const KeyPairDisplay = lazy(async () => {
  const module = await import('@/components/key-display/KeyPairDisplay')
  return { default: module.KeyPairDisplay }
})

const CommandGenerator = lazy(async () => {
  const module = await import('@/components/command-mode/CommandGenerator')
  return { default: module.CommandGenerator }
})

const SSHConfigBuilder = lazy(async () => {
  const module = await import('@/components/ssh-config/SSHConfigBuilder')
  return { default: module.SSHConfigBuilder }
})

const PlatformGuides = lazy(async () => {
  const module = await import('@/components/platform-guides/PlatformGuides')
  return { default: module.PlatformGuides }
})

const SEOContent = lazy(async () => {
  const module = await import('@/components/seo/SEOContent')
  return { default: module.SEOContent }
})

const NotFound = lazy(async () => {
  const module = await import('@/components/pages/NotFound')
  return { default: module.NotFound }
})

const ArticlePage = lazy(async () => {
  const module = await import('@/components/blog/ArticlePage')
  return { default: module.ArticlePage }
})

function TabContentFallback() {
  return (
    <div className="min-h-[220px] flex items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  )
}

function MainContent() {
  const [generatedKeyPair, setGeneratedKeyPair] = useState<KeyPair | null>(null)
  const { t, language } = useTranslation()
  const { resolvedTheme } = useThemeStore()
  const { stars } = useGitHubStars()
  const location = useLocation()
  const navigate = useNavigate()
  const mode = parseToolMode(location.hash) ?? 'generate'
  const languagePath = getLanguagePathname(language)

  useEffect(() => {
    syncPageMetadata(language, buildHomePageMetadata(language, t))
  }, [language, location.pathname, t])

  useEffect(() => {
    if (!parseToolMode(location.hash)) return
    const frame = requestAnimationFrame(() => {
      document.getElementById('ssh-tools')?.scrollIntoView({ block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [location.hash])

  const selectMode = (value: string) => {
    const nextMode = parseToolMode(`#${value}`)
    if (!nextMode || nextMode === mode) return
    trackToolEvent('tool_mode_change', { mode: nextMode, language, origin: 'home' })
    navigate(getToolHref(language, nextMode), { replace: true, preventScrollReset: true })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 min-w-0 max-w-4xl mx-auto px-4 py-6 sm:py-10 w-full">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="-mt-2 sm:-mt-6 mb-1 flex min-h-11 justify-center">
            <GitHubStarBadge stars={stars} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            {t('hero.title')}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Main Tabs */}
        <Card id="ssh-tools" className="operation-panel min-w-0 scroll-mt-20 shadow-lg border-border/50">
          {(['generate', 'commands', 'config', 'guides'] as const).map((anchor) => (
            <span key={anchor} id={anchor} aria-hidden="true" className="block h-0 scroll-mt-20" />
          ))}
          <CardContent className="min-w-0 p-0">
            <Tabs value={mode} onValueChange={selectMode} className="min-w-0 w-full">
              <div className="px-4 pt-4 pb-0">
                <TabsList aria-label={t('navigation.toolLabel')} className="grid h-auto w-full grid-cols-2 gap-1 lg:grid-cols-4">
                  <TabsTrigger value="generate" className="min-h-11 min-w-0 gap-2 whitespace-normal px-2 text-xs sm:text-sm">
                    <Key className="h-4 w-4 shrink-0" />
                    <span>{t('navigation.browser')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="commands" className="min-h-11 min-w-0 gap-2 whitespace-normal px-2 text-xs sm:text-sm">
                    <Terminal className="h-4 w-4 shrink-0" />
                    <span>{t('navigation.computer')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="config" className="min-h-11 min-w-0 gap-2 whitespace-normal px-2 text-xs sm:text-sm">
                    <Settings className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{t('tabs.config')}</span>
                    <span className="sm:hidden">{t('tabs.configShort')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="guides" className="min-h-11 min-w-0 gap-2 whitespace-normal px-2 text-xs sm:text-sm">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{t('tabs.guides')}</span>
                    <span className="sm:hidden">{t('tabs.guidesShort')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="min-w-0 p-4">
                {/* Generate Keys Tab */}
                <TabsContent value="generate" className="mt-0">
                  <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                    <KeyGeneratorForm onGenerated={setGeneratedKeyPair} />
                    <div className="min-w-0">
                      {generatedKeyPair ? (
                        <Suspense fallback={<TabContentFallback />}>
                          <KeyPairDisplay keyPair={generatedKeyPair} />
                        </Suspense>
                      ) : (
                        <div className="h-full min-h-[120px] lg:min-h-[360px] flex items-center justify-center rounded-xl border border-dashed border-border bg-card/30">
                          <div className="text-center text-muted-foreground">
                            <Key className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-base font-medium">{t('generator.noKeysYet')}</p>
                            <p className="text-sm">
                              {t('generator.noKeysHint')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Command Mode Tab */}
                <TabsContent value="commands" className="mt-0">
                  <Suspense fallback={<TabContentFallback />}>
                    <CommandGenerator />
                  </Suspense>
                </TabsContent>

                {/* SSH Config Tab */}
                <TabsContent value="config" className="mt-0">
                  <Suspense fallback={<TabContentFallback />}>
                    <SSHConfigBuilder />
                  </Suspense>
                </TabsContent>

                {/* Platform Guides Tab */}
                <TabsContent value="guides" className="mt-0">
                  <Suspense fallback={<TabContentFallback />}>
                    <PlatformGuides />
                  </Suspense>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <nav aria-label={t('navigation.tasks')} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <span className="w-full font-medium">{t('navigation.tasks')}</span>
          <Link className="text-primary underline underline-offset-4" to={`${languagePath}how-to-set-up-ssh/`}>{t('navigation.install')}</Link>
          <Link className="text-primary underline underline-offset-4" to={`${languagePath}ssh-command/`}>{t('navigation.connect')}</Link>
          <Link className="text-primary underline underline-offset-4" to={`${languagePath}what-is-an-ssh-key/`}>{t('navigation.safety')}</Link>
          <Link className="text-primary underline underline-offset-4" to={getToolHref(language, 'guides')} onClick={() => trackToolEvent('tool_mode_change', { mode: 'guides', language, origin: 'home' })}>{t('navigation.browseGuides')}</Link>
        </nav>

        <Suspense fallback={<div className="mt-16 h-24" />}>
          <SEOContent />
        </Suspense>
      </main>

      <Footer />
      <Toaster position="bottom-right" theme={resolvedTheme} />
    </div>
  )
}

// Language route wrapper that syncs language from URL
function LanguageRoute({ lang }: { lang: Language }) {
  const { setLanguage } = useLanguageStore()

  useEffect(() => {
    setLanguage(lang)
  }, [lang, setLanguage])

  return <MainContent />
}

function SiteInfoRoute({ slug }: { slug: string }) {
  const { setLanguage } = useLanguageStore()
  useEffect(() => {
    setLanguage('en')
    syncPageMetadata('en', buildSiteInfoPageMetadata(slug))
  }, [slug, setLanguage])
  return <SiteInfoPage slug={slug} />
}

function App() {
  const location = useLocation()

  // Sync language from path on initial load and route changes
  useEffect(() => {
    syncLanguageFromPath()
  }, [location.pathname])

  return (
    <Routes>
      {siteInfo.map((page) => <Route key={page.slug} path={`/${page.slug}`} element={<SiteInfoRoute slug={page.slug} />} />)}
      {/* English article routes */}
      {ARTICLE_SLUGS.map((slug: ArticleSlug) => (
        <Route
          key={`en-${slug}`}
          path={`/${slug}`}
          element={
            <Suspense fallback={null}>
              <ArticlePage slug={slug} lang="en" />
            </Suspense>
          }
        />
      ))}

      {/* All non-default language article routes (must be before wildcard routes) */}
      {NON_DEFAULT_LANGUAGE_CONFIG.flatMap((language) => {
        const langPath = getLanguagePathname(language.code).replace(/\/$/, '')
        return ARTICLE_SLUGS.filter((slug: ArticleSlug) =>
          hasArticleTranslation(slug, language.code),
        ).map((slug: ArticleSlug) => (
          <Route
            key={`${language.code}-${slug}`}
            path={`${langPath}/${slug}`}
            element={
              <Suspense fallback={null}>
                <ArticlePage slug={slug} lang={language.code} />
              </Suspense>
            }
          />
        ))
      })}

      {/* Non-default language main pages (must be after article routes) */}
      {NON_DEFAULT_LANGUAGE_CONFIG.map((language) => {
        const path = getLanguagePathname(language.code).replace(/\/$/, '')
        return (
          <Route
            key={`${language.code}-root`}
            path={path}
            element={<LanguageRoute lang={language.code} />}
          />
        )
      })}

      {/* English route (default) */}
      <Route path="/" element={<LanguageRoute lang={DEFAULT_LANGUAGE} />} />

      {/* 404 Not Found for any unknown paths */}
      <Route path="*" element={
        <Suspense fallback={null}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  )
}

export default App

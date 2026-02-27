import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Key, Terminal, Settings, BookOpen } from 'lucide-react'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { KeyGeneratorForm } from '@/components/key-generator/KeyGeneratorForm'
import { useTranslation } from '@/i18n'
import { useLanguageStore, syncLanguageFromPath, type Language } from '@/i18n/languageStore'
import { useThemeStore } from '@/store/themeStore'
import type { KeyPair } from '@/types/keys'

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

const LANGUAGE_PATHS: Record<Language, string> = {
  en: '/',
  zh: '/zh-Hans',
  'zh-Hant': '/zh-Hant',
  ja: '/ja',
  ko: '/ko',
  es: '/es',
  pt: '/pt',
  fr: '/fr',
  de: '/de',
  ru: '/ru',
  it: '/it',
  nl: '/nl',
  pl: '/pl',
  sv: '/sv',
  he: '/he',
  da: '/da',
  nb: '/nb',
  hi: '/hi',
  vi: '/vi',
  tr: '/tr',
  id: '/id',
  fi: '/fi',
  uk: '/uk',
  ar: '/ar',
  th: '/th',
  ro: '/ro',
  cs: '/cs',
  bn: '/bn',
  el: '/el',
  hu: '/hu'
}

const NON_DEFAULT_LANGUAGES = (Object.keys(LANGUAGE_PATHS) as Language[]).filter((lang) => lang !== 'en')

function TabContentFallback() {
  return (
    <div className="min-h-[220px] flex items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  )
}

function MainContent() {
  const [generatedKeyPair, setGeneratedKeyPair] = useState<KeyPair | null>(null)
  const [shouldRenderSeoContent, setShouldRenderSeoContent] = useState(false)
  const seoSentinelRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation()
  const { resolvedTheme } = useThemeStore()

  useEffect(() => {
    if (shouldRenderSeoContent) return

    const sentinel = seoSentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => {
        setShouldRenderSeoContent(true)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldRenderSeoContent(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px 0px' })

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [shouldRenderSeoContent])

  useEffect(() => {
    if (shouldRenderSeoContent) return

    const timer = window.setTimeout(() => {
      setShouldRenderSeoContent(true)
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [shouldRenderSeoContent])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            {t('hero.title')}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Main Tabs */}
        <Card className="operation-panel shadow-lg border-border/50">
          <CardContent className="p-0">
            <Tabs defaultValue="generate" className="w-full">
              <div className="px-4 pt-4 pb-0">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="generate" className="gap-2">
                    <Key className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('tabs.generate')}</span>
                    <span className="sm:hidden">{t('tabs.generateShort')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="commands" className="gap-2">
                    <Terminal className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('tabs.commands')}</span>
                    <span className="sm:hidden">{t('tabs.commandsShort')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="config" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('tabs.config')}</span>
                    <span className="sm:hidden">{t('tabs.configShort')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="guides" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('tabs.guides')}</span>
                    <span className="sm:hidden">{t('tabs.guidesShort')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              <div className="p-4">
                {/* Generate Keys Tab */}
                <TabsContent value="generate" className="mt-0">
                  <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                    <KeyGeneratorForm onGenerated={setGeneratedKeyPair} />
                    <div>
                      {generatedKeyPair ? (
                        <Suspense fallback={<TabContentFallback />}>
                          <KeyPairDisplay keyPair={generatedKeyPair} />
                        </Suspense>
                      ) : (
                        <div className="h-full min-h-[360px] flex items-center justify-center rounded-xl border border-dashed border-border bg-card/30">
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

        {/* SEO Content Section - load after first viewport for faster initial render */}
        <div ref={seoSentinelRef}>
          {shouldRenderSeoContent ? (
            <Suspense fallback={<div className="mt-16 h-24" />}>
              <SEOContent />
            </Suspense>
          ) : (
            <div className="mt-16 h-24" aria-hidden="true" />
          )}
        </div>
      </main>

      <Footer />
      <Toaster position="bottom-right" theme={resolvedTheme} />
    </div>
  )
}

// Update canonical URL based on current language
function updateCanonical(lang: Language) {
  const canonical = document.querySelector('link[rel="canonical"]')
  const baseUrl = 'https://sshkeygenerator.com'

  if (canonical) {
    const path = LANGUAGE_PATHS[lang]
    canonical.setAttribute('href', `${baseUrl}${path === '/' ? '/' : `${path}/`}`)
  }
}

// Language route wrapper that syncs language from URL
function LanguageRoute({ lang }: { lang: Language }) {
  const { setLanguage } = useLanguageStore()

  useEffect(() => {
    setLanguage(lang)
    updateCanonical(lang)
  }, [lang, setLanguage])

  return <MainContent />
}

function App() {
  const location = useLocation()

  // Sync language from path on initial load and route changes
  useEffect(() => {
    syncLanguageFromPath()
  }, [location.pathname])

  return (
    <Routes>
      {NON_DEFAULT_LANGUAGES.flatMap((lang) => {
        const path = LANGUAGE_PATHS[lang]
        return [
          <Route key={`${lang}-nested`} path={`${path}/*`} element={<LanguageRoute lang={lang} />} />,
          <Route key={`${lang}-root`} path={path} element={<LanguageRoute lang={lang} />} />
        ]
      })}

      {/* English route (default) */}
      <Route path="/" element={<LanguageRoute lang="en" />} />

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

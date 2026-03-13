import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Key, Terminal, Settings, BookOpen } from 'lucide-react'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { KeyGeneratorForm } from '@/components/key-generator/KeyGeneratorForm'
import { useTranslation } from '@/i18n'
import {
  DEFAULT_LANGUAGE,
  NON_DEFAULT_LANGUAGE_CONFIG,
  getLanguagePathname,
  useLanguageStore,
  syncLanguageFromPath,
  type Language,
} from '@/i18n'
import { buildHomePageMetadata, syncPageMetadata } from '@/lib/seo'
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
  const location = useLocation()

  useEffect(() => {
    syncPageMetadata(language, buildHomePageMetadata(language, t))
  }, [language, location.pathname, t])

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

function App() {
  const location = useLocation()

  // Sync language from path on initial load and route changes
  useEffect(() => {
    syncLanguageFromPath()
  }, [location.pathname])

  return (
    <Routes>
      {NON_DEFAULT_LANGUAGE_CONFIG.flatMap((language) => {
        const path = getLanguagePathname(language.code).replace(/\/$/, '')
        return [
          <Route
            key={`${language.code}-nested`}
            path={`${path}/*`}
            element={<LanguageRoute lang={language.code} />}
          />,
          <Route
            key={`${language.code}-root`}
            path={path}
            element={<LanguageRoute lang={language.code} />}
          />
        ]
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

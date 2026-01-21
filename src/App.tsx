import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Key, Terminal, Settings, BookOpen } from 'lucide-react'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { KeyGeneratorForm } from '@/components/key-generator/KeyGeneratorForm'
import { KeyPairDisplay } from '@/components/key-display/KeyPairDisplay'
import { CommandGenerator } from '@/components/command-mode/CommandGenerator'
import { SSHConfigBuilder } from '@/components/ssh-config/SSHConfigBuilder'
import { PlatformGuides } from '@/components/platform-guides/PlatformGuides'
import { SEOContent } from '@/components/seo/SEOContent'
import { useTranslation } from '@/i18n'
import { useLanguageStore, syncLanguageFromPath } from '@/i18n/languageStore'
import { useThemeStore } from '@/store/themeStore'
import type { KeyPair } from '@/types/keys'

function MainContent() {
  const [generatedKeyPair, setGeneratedKeyPair] = useState<KeyPair | null>(null)
  const { t } = useTranslation()
  const { resolvedTheme } = useThemeStore()

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
                        <KeyPairDisplay keyPair={generatedKeyPair} />
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
                  <CommandGenerator />
                </TabsContent>

                {/* SSH Config Tab */}
                <TabsContent value="config" className="mt-0">
                  <SSHConfigBuilder />
                </TabsContent>

                {/* Platform Guides Tab */}
                <TabsContent value="guides" className="mt-0">
                  <PlatformGuides />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* SEO Content Section */}
        <SEOContent />
      </main>

      <Footer />
      <Toaster position="bottom-right" theme={resolvedTheme} />
    </div>
  )
}

// Language route wrapper that syncs language from URL
function LanguageRoute({ lang }: { lang: 'en' | 'zh' }) {
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
      {/* Chinese route */}
      <Route path="/zh-Hans/*" element={<LanguageRoute lang="zh" />} />
      <Route path="/zh-Hans" element={<LanguageRoute lang="zh" />} />

      {/* English route (default) */}
      <Route path="/" element={<LanguageRoute lang="en" />} />

      {/* Redirect any unknown paths to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

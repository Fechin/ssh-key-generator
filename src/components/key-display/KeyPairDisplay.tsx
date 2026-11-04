import { useEffect, useRef, useState } from 'react'
import { Lock, Globe, Fingerprint, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/common/CopyButton'
import { DownloadButton } from '@/components/common/DownloadButton'
import { getLanguagePathname, useTranslation } from '@/i18n'
import type { KeyPair } from '@/types/keys'

interface KeyPairDisplayProps {
  keyPair: KeyPair
}

export function KeyPairDisplay({ keyPair }: KeyPairDisplayProps) {
  const [revealedFingerprint, setRevealedFingerprint] = useState<string | null>(null)
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  const isPrivateKeyVisible = revealedFingerprint === keyPair.fingerprint
  const privateKeyFilename = keyPair.algorithm === 'ed25519' ? 'id_ed25519' : 'id_rsa'
  const publicKeyFilename = `${privateKeyFilename}.pub`
  const { t, language } = useTranslation()
  const serverGuideUrl = `${getLanguagePathname(language)}how-to-set-up-ssh/`
  const analyticsContext = (target: 'public_key' | 'private_key' | 'fingerprint') => ({
    target, algorithm: keyPair.algorithm, origin: 'result' as const,
  })

  useEffect(() => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return

    const frame = window.requestAnimationFrame(() => {
      resultsHeading.current?.focus({ preventScroll: true })
      resultsHeading.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [keyPair])

  // Generate masked version of the private key
  const maskedPrivateKey = keyPair.privateKey.split('\n').map((line) => {
    // Keep header and footer visible
    if (line.startsWith('-----') || line.endsWith('-----')) {
      return line
    }
    // Mask the actual key content
    return '●'.repeat(Math.min(line.length, 70))
  }).join('\n')

  return (
    <section aria-labelledby="key-results" className="min-w-0 space-y-4">
      <div>
        <h2 ref={resultsHeading} id="key-results" tabIndex={-1} className="scroll-mt-20 rounded-md text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {t('workflow.resultsTitle')}
        </h2>
        <p role="status" className="mt-1 flex items-start gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
          {t('workflow.success')}
        </p>
      </div>
      {/* Public Key */}
      <Card className="min-w-0">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Globe className="h-4 w-4 text-success" />
              <CardTitle className="text-sm">{t('keyDisplay.publicKey')}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <CopyButton text={keyPair.publicKey} label={t('keyDisplay.copy')} analyticsContext={analyticsContext('public_key')} />
              <DownloadButton
                content={keyPair.publicKey}
                filename={publicKeyFilename}
                label={t('keyDisplay.download')}
                analyticsContext={analyticsContext('public_key')}
              />
            </div>
          </div>
          <CardDescription className="text-xs">
            {t('keyDisplay.publicKeyDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Textarea
            readOnly
            value={keyPair.publicKey}
            aria-label={t('keyDisplay.publicKey')}
            className="min-h-[70px] min-w-0 max-w-full resize-none text-xs"
          />
        </CardContent>
      </Card>

      {/* Private Key */}
      <Card className="min-w-0 border-warning/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              <CardTitle className="text-sm">{t('keyDisplay.privateKey')}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevealedFingerprint(isPrivateKeyVisible ? null : keyPair.fingerprint)}
                className="h-8 px-2 text-xs gap-1.5"
              >
                {isPrivateKeyVisible ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    {t('keyDisplay.hide')}
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    {t('keyDisplay.reveal')}
                  </>
                )}
              </Button>
              <CopyButton text={keyPair.privateKey} label={t('keyDisplay.copy')} analyticsContext={analyticsContext('private_key')} />
              <DownloadButton
                content={keyPair.privateKey}
                filename={privateKeyFilename}
                label={t('keyDisplay.download')}
                analyticsContext={analyticsContext('private_key')}
              />
            </div>
          </div>
          <CardDescription className="text-xs text-warning">
            {t('keyDisplay.privateKeyWarning')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="relative">
            <Textarea
              readOnly
              value={isPrivateKeyVisible ? keyPair.privateKey : maskedPrivateKey}
              aria-label={t('keyDisplay.privateKey')}
              className="min-h-[180px] min-w-0 max-w-full resize-none text-xs"
            />
            {!isPrivateKeyVisible && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-background/80 to-transparent pointer-events-none">
                <div className="bg-background/95 px-4 py-2 rounded-lg border shadow-sm">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    {t('keyDisplay.clickToReveal')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border bg-card/50 p-4">
        <h3 className="mb-3 text-sm font-semibold">{t('workflow.nextTitle')}</h3>
        <ol className="list-decimal space-y-3 pl-4 text-xs text-muted-foreground marker:font-semibold marker:text-foreground">
          <li className="pl-1">
            <p className="font-medium text-foreground">{t('workflow.saveTitle')}</p>
            <p className="mt-1">{t('workflow.saveHint')}</p>
          </li>
          <li className="pl-1">
            <p className="font-medium text-foreground">{t('workflow.installTitle')}</p>
            <p className="mt-1">{t('workflow.installHint')}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
              <a href="https://docs.github.com/en/authentication/connecting-to-github-with-ssh" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{t('workflow.githubDocs')}</a>
              <a href="https://docs.gitlab.com/user/ssh/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{t('workflow.gitlabDocs')}</a>
              <a href={serverGuideUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">{t('workflow.serverGuide')}</a>
            </div>
          </li>
          <li className="pl-1">
            <p className="font-medium text-foreground">{t('workflow.testTitle')}</p>
            <p className="mt-1">{t('workflow.testHint')}</p>
          </li>
        </ol>
      </div>

      {/* Fingerprint & Randomart */}
      <Card className="min-w-0">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            <CardTitle className="text-sm">{t('keyDisplay.fingerprint')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Tabs defaultValue="sha256">
            <TabsList className="h-auto max-w-full flex-wrap">
              <TabsTrigger value="sha256">SHA256</TabsTrigger>
              <TabsTrigger value="md5">MD5</TabsTrigger>
              <TabsTrigger value="randomart">Randomart</TabsTrigger>
            </TabsList>
            <TabsContent value="sha256" className="mt-3">
              <div className="flex min-w-0 items-center gap-2">
                <code className="min-w-0 flex-1 p-2.5 bg-background rounded-md text-xs font-mono break-all">
                  {keyPair.fingerprint}
                </code>
                <CopyButton text={keyPair.fingerprint} analyticsContext={analyticsContext('fingerprint')} />
              </div>
            </TabsContent>
            <TabsContent value="md5" className="mt-3">
              <div className="flex min-w-0 items-center gap-2">
                <code className="min-w-0 flex-1 p-2.5 bg-background rounded-md text-xs font-mono break-all">
                  {keyPair.fingerprintMd5}
                </code>
                <CopyButton text={keyPair.fingerprintMd5} analyticsContext={analyticsContext('fingerprint')} />
              </div>
            </TabsContent>
            <TabsContent value="randomart" className="mt-3">
              <pre className="min-w-0 max-w-full p-2.5 bg-background rounded-md text-xs font-mono overflow-x-auto">
                {keyPair.randomart}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  )
}

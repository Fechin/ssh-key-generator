import { useState } from 'react'
import { Lock, Globe, Fingerprint, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/common/CopyButton'
import { DownloadButton } from '@/components/common/DownloadButton'
import { useTranslation } from '@/i18n'
import type { KeyPair } from '@/types/keys'

interface KeyPairDisplayProps {
  keyPair: KeyPair
}

export function KeyPairDisplay({ keyPair }: KeyPairDisplayProps) {
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false)
  const privateKeyFilename = keyPair.algorithm === 'ed25519' ? 'id_ed25519' : 'id_rsa'
  const publicKeyFilename = `${privateKeyFilename}.pub`
  const { t } = useTranslation()

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
    <div className="space-y-4">
      {/* Public Key */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-success" />
              <CardTitle className="text-sm">{t('keyDisplay.publicKey')}</CardTitle>
            </div>
            <div className="flex gap-1.5">
              <CopyButton text={keyPair.publicKey} label={t('keyDisplay.copy')} />
              <DownloadButton
                content={keyPair.publicKey}
                filename={publicKeyFilename}
                label={t('keyDisplay.download')}
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
            className="min-h-[70px] resize-none text-xs"
          />
        </CardContent>
      </Card>

      {/* Private Key */}
      <Card className="border-warning/50">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              <CardTitle className="text-sm">{t('keyDisplay.privateKey')}</CardTitle>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)}
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
              <CopyButton text={keyPair.privateKey} label={t('keyDisplay.copy')} />
              <DownloadButton
                content={keyPair.privateKey}
                filename={privateKeyFilename}
                label={t('keyDisplay.download')}
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
              className="min-h-[180px] resize-none text-xs"
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

      {/* Fingerprint & Randomart */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            <CardTitle className="text-sm">{t('keyDisplay.fingerprint')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Tabs defaultValue="sha256">
            <TabsList>
              <TabsTrigger value="sha256">SHA256</TabsTrigger>
              <TabsTrigger value="md5">MD5</TabsTrigger>
              <TabsTrigger value="randomart">Randomart</TabsTrigger>
            </TabsList>
            <TabsContent value="sha256" className="mt-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 bg-background rounded-md text-xs font-mono break-all">
                  {keyPair.fingerprint}
                </code>
                <CopyButton text={keyPair.fingerprint} />
              </div>
            </TabsContent>
            <TabsContent value="md5" className="mt-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 bg-background rounded-md text-xs font-mono break-all">
                  {keyPair.fingerprintMd5}
                </code>
                <CopyButton text={keyPair.fingerprintMd5} />
              </div>
            </TabsContent>
            <TabsContent value="randomart" className="mt-3">
              <pre className="p-2.5 bg-background rounded-md text-xs font-mono overflow-x-auto">
                {keyPair.randomart}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

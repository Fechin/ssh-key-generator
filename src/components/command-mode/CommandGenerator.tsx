import { useState } from 'react'
import { Terminal, Apple, Monitor } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CopyButton } from '@/components/common/CopyButton'
import { useTranslation } from '@/i18n'
import type { KeyAlgorithm } from '@/types/keys'
import {
  generateSSHCommand,
  generateSSHSetupCommands,
  generateWindowsAgentCommands,
  validateSSHCommandOptions,
  type SSHCommandPlatform,
} from '@/lib/sshCommands'

export function CommandGenerator() {
  const [algorithm, setAlgorithm] = useState<KeyAlgorithm>('ed25519')
  const [comment, setComment] = useState('user@example.com')
  const [filename, setFilename] = useState('')
  const [platform, setPlatform] = useState<SSHCommandPlatform>('macos')
  const { t } = useTranslation()
  const options = { algorithm, comment, filename }
  const invalid = validateSSHCommandOptions(options, platform)
  const command = invalid ? '' : generateSSHCommand(options, platform)
  const setup = invalid ? '' : generateSSHSetupCommands(options, platform, {
    createDirectory: t('commandUx.createDirectory'),
    generateKey: t('commandUx.generateKey'),
    startAgent: t('commandUx.startAgent'),
    addKey: t('commandUx.addKey'),
    permissions: t('commandUx.permissions'),
    publicKey: t('commandUx.publicKey'),
  })

  const algorithms: { value: KeyAlgorithm; label: string }[] = [
    { value: 'ed25519', label: t('algorithms.ed25519') },
    { value: 'rsa-4096', label: t('algorithms.rsa4096') },
    { value: 'rsa-2048', label: t('algorithms.rsa2048') },
  ]

  return (
    <div>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Terminal className="h-4 w-4" />
          {t('commands.title')}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t('commands.description')}
        </p>
      </div>
      <div className="space-y-5">
        {/* Options */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="cmd-algorithm" className="text-sm">{t('commands.algorithm')}</Label>
            <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as KeyAlgorithm)}>
              <SelectTrigger id="cmd-algorithm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {algorithms.map((algo) => (
                  <SelectItem key={algo.value} value={algo.value}>
                    {algo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cmd-comment" className="text-sm">{t('commands.comment')}</Label>
            <Input
              id="cmd-comment"
              type="text"
              placeholder="user@example.com"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              aria-invalid={invalid === 'comment'}
              aria-describedby={invalid === 'comment' ? 'cmd-error' : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cmd-filename" className="text-sm">{t('commands.filename')}</Label>
            <Input
              id="cmd-filename"
              type="text"
              placeholder={algorithm === 'ed25519' ? 'id_ed25519' : 'id_rsa'}
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              aria-invalid={invalid === 'filename'}
              aria-describedby={invalid === 'filename' ? 'cmd-error' : 'cmd-filename-hint'}
            />
            <p id="cmd-filename-hint" className="text-xs text-muted-foreground">{t('commandUx.filenameHint')}</p>
          </div>
        </div>
        {invalid && (
          <p id="cmd-error" role="alert" className="text-sm text-destructive">
            {t(invalid === 'filename' ? 'commandUx.invalidFilename' : 'commandUx.invalidComment')}
          </p>
        )}

        {/* Platform Commands */}
        <Tabs value={platform} onValueChange={(value) => setPlatform(value as SSHCommandPlatform)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="macos" className="gap-2">
              <Apple className="h-4 w-4" />
              macOS
            </TabsTrigger>
            <TabsTrigger value="linux" className="gap-2">
              <Terminal className="h-4 w-4" />
              Linux
            </TabsTrigger>
            <TabsTrigger value="windows" className="gap-2">
              <Monitor className="h-4 w-4" />
              Windows
            </TabsTrigger>
          </TabsList>

          <TabsContent value={platform} className="space-y-4">
            {platform === 'windows' && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">{t('commandUx.windowsShell')}</p>
                <p>{t('commandUx.windowsHint')}</p>
              </div>
            )}
            {!invalid && (
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm">{t('commands.quickCommand')}</Label>
                    <CopyButton
                      text={command}
                      label={t('keyDisplay.copy')}
                      size="sm"
                      analyticsContext={{ target: 'command', algorithm, origin: 'home' }}
                    />
                  </div>
                  <pre dir="ltr" className="max-w-full p-2.5 bg-background rounded-md text-xs font-mono overflow-x-auto border border-border/50"><code>{command}</code></pre>
                </div>
                {platform === 'windows' && (
                  <details className="rounded-md border border-border/50 p-3 text-xs">
                    <summary className="cursor-pointer font-medium">{t('commandUx.agentSetup')}</summary>
                    <p className="mt-2 text-muted-foreground">{t('commandUx.agentHint')}</p>
                    <div className="mt-2 flex justify-end">
                      <CopyButton
                        text={generateWindowsAgentCommands()}
                        label={t('keyDisplay.copy')}
                        size="sm"
                        analyticsContext={{ target: 'command', algorithm, origin: 'home' }}
                      />
                    </div>
                    <pre dir="ltr" className="mt-2 max-w-full overflow-x-auto rounded-md bg-background p-2.5 font-mono"><code>{generateWindowsAgentCommands()}</code></pre>
                  </details>
                )}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm">{t('commands.completeSetup')}</Label>
                    <CopyButton
                      text={setup}
                      label={t('commands.copyAll')}
                      size="sm"
                      analyticsContext={{ target: 'command', algorithm, origin: 'home' }}
                    />
                  </div>
                  <pre dir="ltr" className="max-w-full p-2.5 bg-background rounded-md text-xs font-mono overflow-x-auto max-h-[280px] border border-border/50"><code>{setup}</code></pre>
                </div>
              </>
            )}
            <a
              href={platform === 'windows'
                ? 'https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_keymanagement'
                : 'https://man.openbsd.org/ssh-keygen'}
              className="inline-flex text-xs text-primary underline underline-offset-2"
            >
              {t('commandUx.source')}
            </a>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

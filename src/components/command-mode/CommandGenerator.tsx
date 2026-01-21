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

type Platform = 'linux' | 'macos' | 'windows'

export function CommandGenerator() {
  const [algorithm, setAlgorithm] = useState<KeyAlgorithm>('ed25519')
  const [comment, setComment] = useState('user@example.com')
  const [filename, setFilename] = useState('')
  const { t } = useTranslation()

  const algorithms: { value: KeyAlgorithm; label: string }[] = [
    { value: 'ed25519', label: t('algorithms.ed25519') },
    { value: 'rsa-4096', label: t('algorithms.rsa4096') },
    { value: 'rsa-2048', label: t('algorithms.rsa2048') },
  ]

  const getFilename = () => {
    if (filename) return filename
    return algorithm === 'ed25519' ? 'id_ed25519' : 'id_rsa'
  }

  const generateCommand = (platform: Platform): string => {
    const file = getFilename()
    const algoFlag = algorithm === 'ed25519' ? 'ed25519' : 'rsa'
    const bits = algorithm === 'rsa-4096' ? ' -b 4096' : algorithm === 'rsa-2048' ? ' -b 2048' : ''

    const baseCommand = `ssh-keygen -t ${algoFlag}${bits} -C "${comment}" -f ~/.ssh/${file}`

    switch (platform) {
      case 'linux':
        return baseCommand
      case 'macos':
        return baseCommand
      case 'windows':
        return baseCommand.replace('~/.ssh/', '%USERPROFILE%\\.ssh\\')
      default:
        return baseCommand
    }
  }

  const generateSetupCommands = (platform: Platform): string[] => {
    const file = getFilename()
    const commands: string[] = []

    if (platform === 'windows') {
      commands.push('# Create .ssh directory if it doesn\'t exist')
      commands.push('mkdir %USERPROFILE%\\.ssh 2>nul')
      commands.push('')
      commands.push('# Generate the key')
      commands.push(generateCommand(platform))
      commands.push('')
      commands.push('# Start ssh-agent (PowerShell)')
      commands.push('Get-Service ssh-agent | Set-Service -StartupType Automatic')
      commands.push('Start-Service ssh-agent')
      commands.push('')
      commands.push('# Add key to ssh-agent')
      commands.push(`ssh-add %USERPROFILE%\\.ssh\\${file}`)
    } else {
      commands.push('# Create .ssh directory if it doesn\'t exist')
      commands.push('mkdir -p ~/.ssh && chmod 700 ~/.ssh')
      commands.push('')
      commands.push('# Generate the key')
      commands.push(generateCommand(platform))
      commands.push('')
      commands.push('# Start ssh-agent and add key')
      commands.push('eval "$(ssh-agent -s)"')

      if (platform === 'macos') {
        commands.push('')
        commands.push('# Add key to macOS Keychain')
        commands.push(`ssh-add --apple-use-keychain ~/.ssh/${file}`)
      } else {
        commands.push(`ssh-add ~/.ssh/${file}`)
      }

      commands.push('')
      commands.push('# Set proper permissions on private key')
      commands.push(`chmod 600 ~/.ssh/${file}`)
    }

    commands.push('')
    commands.push('# Copy public key to clipboard')
    if (platform === 'macos') {
      commands.push(`pbcopy < ~/.ssh/${file}.pub`)
    } else if (platform === 'linux') {
      commands.push(`xclip -selection clipboard < ~/.ssh/${file}.pub`)
      commands.push('# or')
      commands.push(`cat ~/.ssh/${file}.pub`)
    } else {
      commands.push(`type %USERPROFILE%\\.ssh\\${file}.pub | clip`)
    }

    return commands
  }

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
            />
          </div>
        </div>

        {/* Platform Commands */}
        <Tabs defaultValue="macos">
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

          {(['macos', 'linux', 'windows'] as Platform[]).map((platform) => (
            <TabsContent key={platform} value={platform} className="space-y-3">
              {/* Quick Command */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t('commands.quickCommand')}</Label>
                  <CopyButton text={generateCommand(platform)} label={t('keyDisplay.copy')} size="sm" />
                </div>
                <pre className="p-2.5 bg-background rounded-md text-xs font-mono overflow-x-auto border border-border/50">
                  {generateCommand(platform)}
                </pre>
              </div>


              {/* Full Setup */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t('commands.completeSetup')}</Label>
                  <CopyButton
                    text={generateSetupCommands(platform).join('\n')}
                    label={t('commands.copyAll')}
                    size="sm"
                  />
                </div>
                <pre className="p-2.5 bg-background rounded-md text-xs font-mono overflow-x-auto max-h-[280px] border border-border/50">
                  {generateSetupCommands(platform).join('\n')}
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

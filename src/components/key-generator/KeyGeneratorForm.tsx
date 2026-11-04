import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Key, Loader2, Shield, Info, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useKeyGenerator } from '@/hooks/useKeyGenerator'
import { useTranslation } from '@/i18n'
import { getToolHref } from '@/lib/toolNavigation'
import type { KeyAlgorithm, KeyPair } from '@/types/keys'

interface KeyGeneratorFormProps {
  onGenerated?: (keyPair: KeyPair) => void
}

export function KeyGeneratorForm({ onGenerated }: KeyGeneratorFormProps) {
  const [algorithm, setAlgorithm] = useState<KeyAlgorithm>('ed25519')
  const [comment, setComment] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const { generate, isGenerating, error } = useKeyGenerator()
  const { t, language } = useTranslation()

  const hasPassphrase = passphrase.length > 0
  const passphraseError = hasPassphrase && passphrase !== confirmPassphrase

  const algorithms: { value: KeyAlgorithm; label: string; description: string }[] = [
    {
      value: 'ed25519',
      label: t('algorithms.ed25519'),
      description: t('algorithms.ed25519Desc'),
    },
    {
      value: 'rsa-4096',
      label: t('algorithms.rsa4096'),
      description: t('algorithms.rsa4096Desc'),
    },
    {
      value: 'rsa-2048',
      label: t('algorithms.rsa2048'),
      description: t('algorithms.rsa2048Desc'),
    },
  ]

  const handleGenerate = async () => {
    if (passphraseError) return

    const finalComment = comment.trim() || `key-${Date.now()}`
    const keyPair = await generate({
      algorithm,
      comment: finalComment,
      passphrase: hasPassphrase ? passphrase : undefined,
    })

    if (keyPair && onGenerated) {
      onGenerated(keyPair)
    }
  }

  return (
    <div className="min-w-0">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-panel font-semibold">
          <Key className="h-4 w-4" />
          {t('generator.title')}
        </h2>
        <p className="text-support text-muted-foreground mt-1">
          {t('generator.description')}
        </p>
      </div>
      <div className="space-y-5">
        {/* Algorithm Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="algorithm" className="text-ui">{t('generator.algorithm')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('generator.algorithmTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as KeyAlgorithm)}>
            <SelectTrigger id="algorithm" className="min-w-0 [&>span]:min-w-0">
              <SelectValue>{algorithms.find((option) => option.value === algorithm)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {algorithms.map((algo) => (
                <SelectItem key={algo.value} value={algo.value}>
                  <div className="flex flex-col">
                    <span>{algo.label}</span>
                    <span className="text-support text-muted-foreground">{algo.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Comment Input */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="comment" className="text-ui">{t('generator.comment')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('generator.commentTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="comment"
            type="text"
            placeholder={t('generator.commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Passphrase Input */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="passphrase" className="text-ui">{t('generator.passphrase')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('generator.passphraseTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Input
              id="passphrase"
              type={showPassphrase ? 'text' : 'password'}
              placeholder={t('generator.passphrasePlaceholder')}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-w-11 min-h-11 flex items-center justify-center"
              aria-label={showPassphrase ? t('workflow.hidePassphrase') : t('workflow.showPassphrase')}
            >
              {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Passphrase (shown only when passphrase is entered) */}
        {hasPassphrase && (
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassphrase" className="text-ui">{t('generator.confirmPassphrase')}</Label>
            <Input
              id="confirmPassphrase"
              type={showPassphrase ? 'text' : 'password'}
              placeholder={t('generator.confirmPassphrasePlaceholder')}
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              className={passphraseError ? 'border-destructive' : ''}
              aria-invalid={passphraseError}
              aria-describedby={passphraseError ? 'passphrase-confirmation-hint' : undefined}
            />
            {passphraseError && (
              <p id="passphrase-confirmation-hint" className="text-support text-destructive">
                {confirmPassphrase.length === 0 ? t('workflow.confirmRequired') : t('generator.passphrasesMismatch')}
              </p>
            )}
          </div>
        )}

        {/* No passphrase warning */}
        {!hasPassphrase && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-support text-muted-foreground">
              {t('generator.noPassphraseWarning')}
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-support">
            <p className="font-medium">{t('workflow.errorTitle')}</p>
            <p className="mt-1 text-muted-foreground">
              {t(error === 'unsupported_browser' ? 'workflow.errorUnsupported' : 'workflow.errorGeneric', {
                mode: t('navigation.computer'),
              })}
            </p>
            <Link to={getToolHref(language, 'commands')} className="mt-2 inline-block text-link underline underline-offset-2">
              {t('navigation.computer')}
            </Link>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || passphraseError}
          className="w-full h-auto min-h-11 whitespace-normal px-4 py-2"
          size="default"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('generator.generating')}
            </>
          ) : (
            <>
              <Key className="h-4 w-4" />
              {error ? t('workflow.retry') : t('generator.generateButton')}
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-success/10 border border-success/20">
          <Shield className="h-4 w-4 text-success mt-0.5 shrink-0" />
          <div className="text-support">
            <p className="font-medium text-success">{t('generator.securityTitle')}</p>
            <p className="text-muted-foreground mt-0.5">
              {t('generator.securityDesc')}
            </p>
            <a href="/privacy/" className="mt-1 inline-block text-link underline underline-offset-2">
              {t('workflow.privacy')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

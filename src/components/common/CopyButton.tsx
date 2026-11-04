import { useState, useCallback, useEffect, useRef } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import { trackToolEvent, type ToolAnalyticsContext } from '@/lib/analytics'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  label?: string
  analyticsContext?: ToolAnalyticsContext
}

export function CopyButton({
  text,
  className,
  variant = 'outline',
  size = 'sm',
  label,
  analyticsContext,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t, language } = useTranslation()

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
  }, [])

  const handleCopy = useCallback(async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current)
    setCopyFailed(false)
    setCopied(false)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
      if (analyticsContext) {
        const event = analyticsContext.target === 'command' ? 'command_copy'
          : analyticsContext.target === 'article_code' ? 'article_code_copy' : 'key_copy'
        trackToolEvent(event, { ...analyticsContext, language })
      }
    } catch {
      setCopyFailed(true)
    }
  }, [text, analyticsContext, language])

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleCopy}
        className={cn('gap-1.5', className)}
        aria-label={copied ? t('keyDisplay.copied') : label ?? t('keyDisplay.copy')}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {label && <span>{t('keyDisplay.copied')}</span>}
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {label && <span>{label}</span>}
          </>
        )}
      </Button>
      <span role="status" aria-live="polite" className={copyFailed ? 'max-w-48 text-xs text-destructive' : 'sr-only'}>
        {copyFailed ? t('interaction.copyFailed') : copied ? t('keyDisplay.copied') : ''}
      </span>
    </span>
  )
}

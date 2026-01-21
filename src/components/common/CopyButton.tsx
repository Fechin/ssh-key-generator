import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  label?: string
}

export function CopyButton({
  text,
  className,
  variant = 'outline',
  size = 'sm',
  label
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }, [text])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('gap-1.5', className)}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {label && <span>{t('keyDisplay.copied')}</span>}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label && <span>{label}</span>}
        </>
      )}
    </Button>
  )
}

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'
import { trackToolEvent, type ToolAnalyticsContext } from '@/lib/analytics'

interface DownloadButtonProps {
  content: string
  filename: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  label?: string
  analyticsContext?: ToolAnalyticsContext
}

export function DownloadButton({
  content,
  filename,
  className,
  variant = 'outline',
  size = 'sm',
  label,
  analyticsContext,
}: DownloadButtonProps) {
  const [downloadFailed, setDownloadFailed] = useState(false)
  const { t, language } = useTranslation()
  const handleDownload = () => {
    setDownloadFailed(false)
    let url: string | undefined
    let anchor: HTMLAnchorElement | undefined
    try {
      const blob = new Blob([content], { type: 'text/plain' })
      url = URL.createObjectURL(blob)
      anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      if (analyticsContext) trackToolEvent('key_download', { ...analyticsContext, language })
    } catch {
      setDownloadFailed(true)
    } finally {
      anchor?.remove()
      if (url) URL.revokeObjectURL(url)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleDownload}
        className={cn('gap-1.5', className)}
        aria-label={label ?? t('keyDisplay.download')}
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {label && <span>{label}</span>}
      </Button>
      <span role="status" aria-live="polite" className={downloadFailed ? 'max-w-48 text-xs text-destructive' : 'sr-only'}>
        {downloadFailed ? t('interaction.downloadFailed') : ''}
      </span>
    </span>
  )
}

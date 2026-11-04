import { Children, isValidElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { CopyButton } from '@/components/common/CopyButton'
import { useTranslation } from '@/i18n'

function getCodeText(children: ReactNode): string {
  return Children.toArray(children).map((child) => {
    if (typeof child === 'string' || typeof child === 'number') return String(child)
    return isValidElement<{ children?: ReactNode }>(child) ? getCodeText(child.props.children) : ''
  }).join('')
}

export function ArticleCodeBlock({ children, className = '', ...props }: ComponentPropsWithoutRef<'pre'>) {
  const { t } = useTranslation()

  return (
    <div className="mb-4 min-w-0 max-w-full overflow-hidden rounded-lg bg-muted">
      <div className="flex justify-end px-2 pt-2">
        <CopyButton
          text={getCodeText(children)}
          label={t('guideActions.copyCode')}
          size="sm"
          analyticsContext={{ target: 'article_code', origin: 'article' }}
        />
      </div>
      <pre dir="ltr" className={`max-w-full overflow-x-auto p-4 pt-2 text-left text-sm ${className}`} {...props}>{children}</pre>
    </div>
  )
}

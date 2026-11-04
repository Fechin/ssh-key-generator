import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Key, Terminal } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { trackToolEvent } from '@/lib/analytics'
import { getToolHref, type ToolMode } from '@/lib/toolNavigation'
import { ArticleContext } from './articleContext'

interface SectionLink {
  id: string
  text: string
}

export function ArticleTools() {
  const context = useContext(ArticleContext)
  const { t } = useTranslation()
  const [sections, setSections] = useState<SectionLink[]>([])
  const bodyRef = context?.bodyRef
  const slug = context?.slug

  useEffect(() => {
    const body = bodyRef?.current
    if (!body) return

    let frame = 0
    const collect = () => {
      const headings = Array.from(body.querySelectorAll('h2[id]'))
      const next = headings.length >= 6 && (body.textContent?.length ?? 0) > 3500
        ? headings.map((heading) => ({ id: heading.id, text: heading.textContent ?? '' }))
        : []
      setSections((current) => current.length === next.length && current.every(
        (item, index) => item.id === next[index].id && item.text === next[index].text,
      ) ? current : next)
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(collect)
    }
    // MDX may resolve after the layout effect; observe content arrival without
    // replacing or waiting to display the server-rendered article.
    const observer = new MutationObserver(schedule)
    observer.observe(body, { childList: true, subtree: true })
    schedule()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [bodyRef, slug])

  if (!context) return null

  const prefersCommands = context.slug === 'ssh-keygen' || context.slug === 'ssh-command'
  const primaryMode: ToolMode = prefersCommands ? 'commands' : 'generate'
  const secondaryMode: ToolMode = context.slug === 'how-to-set-up-ssh' ? 'guides' : prefersCommands ? 'generate' : 'commands'
  const label = (mode: ToolMode) => t(`guideActions.${mode}`)
  const track = (mode: ToolMode) => trackToolEvent('guide_to_tool', {
    language: context.language,
    mode,
    origin: 'article',
  })

  return (
    <div className="not-prose mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {[primaryMode, secondaryMode].map((mode, index) => (
          <Link
            key={mode}
            to={getToolHref(context.language, mode)}
            onClick={() => track(mode)}
            className={index === 0
              ? 'inline-flex min-h-9 items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-ui font-medium text-link hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              : 'inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 py-2 text-ui font-medium text-link hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'}
          >
            {mode === 'generate' ? <Key aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" /> : <Terminal aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-primary" />}
            {label(mode)}
          </Link>
        ))}
      </div>
      {sections.length > 0 && (
        <nav aria-label={t('guideActions.contents')}>
          <details className="rounded-lg border border-border px-3 py-2 text-ui">
            <summary className="cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t('guideActions.contents')}</summary>
            <ul className="mt-3 space-y-2 pb-1 text-support">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${encodeURIComponent(section.id)}`} className="text-link underline-offset-4 hover:underline">
                    {section.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </nav>
      )}
    </div>
  )
}

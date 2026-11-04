import { Key, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { LanguageToggle } from '@/components/common/LanguageToggle'
import { GitHubMark } from '@/components/common/GitHubMark'
import { getLanguagePathname, useLanguageStore, useTranslation } from '@/i18n'

export function Header() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between w-full">
        <Link
          to={getLanguagePathname(language)}
          aria-label={t('notFound.backHome')}
          className="me-2 flex min-w-0 flex-1 items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:gap-3"
        >
          <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <span className="block truncate font-semibold text-sm sm:text-base leading-none" title={t('header.title')}>{t('header.title')}</span>
            <p className="truncate text-xs text-muted-foreground">{t('header.subtitle')}</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
            <Shield className="h-3 w-3" />
            {t('header.clientSide')}
          </div>
          <LanguageToggle />
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 [&_svg]:size-5" asChild>
            <a
              href="https://github.com/Fechin/ssh-key-generator"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('header.viewOnGitHub')}
            >
              <GitHubMark className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

import { Shield, Heart } from 'lucide-react'
import { useTranslation } from '@/i18n'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="grid gap-6 md:grid-cols-3">
          {/* About */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">{t('footer.about')}</h3>
            <p className="text-xs text-muted-foreground">
              {t('footer.aboutDesc')}
            </p>
          </div>

          {/* Security */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-success" />
              {t('footer.securityFirst')}
            </h3>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>{t('footer.security1')}</li>
              <li>{t('footer.security2')}</li>
              <li>{t('footer.security3')}</li>
              <li>{t('footer.security4')}</li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">{t('footer.resources')}</h3>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>
                <a
                  href="https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {t('footer.sshKeyGuide')}
                </a>
              </li>
              <li>
                <a
                  href="https://docs.gitlab.com/ee/user/ssh.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {t('footer.githubSetup')}
                </a>
              </li>
              <li>
                <a
                  href="https://www.ssh.com/academy/ssh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {t('footer.bestPractices')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            {t('footer.madeWith')} <Heart className="h-3 w-3 inline text-destructive" /> {t('footer.forDevelopers')}
          </p>
          <p>{t('footer.copyright', { year: currentYear.toString() })}</p>
        </div>
      </div>
    </footer>
  )
}

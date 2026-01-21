import { FileQuestion, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n'
import { useLanguageStore, getLanguageBasePath } from '@/i18n/languageStore'

export function NotFound() {
  const { t } = useTranslation()
  const { language } = useLanguageStore()
  const navigate = useNavigate()

  const handleBackHome = () => {
    const basePath = getLanguageBasePath(language)
    navigate(basePath || '/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <FileQuestion className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h1 className="text-6xl font-bold text-primary mb-2">
            {t('notFound.code')}
          </h1>

          <h2 className="text-xl font-semibold mb-4">
            {t('notFound.title')}
          </h2>

          <p className="text-muted-foreground mb-8">
            {t('notFound.description')}
          </p>

          <Button onClick={handleBackHome} className="gap-2">
            <Home className="h-4 w-4" />
            {t('notFound.backHome')}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

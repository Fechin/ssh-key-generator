import { Globe, ChevronDown, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguageStore } from '@/i18n'

const languages = [
  { code: 'en' as const, label: 'English', flag: '🇺🇸', path: '/' },
  { code: 'zh' as const, label: '简体中文', flag: '🇨🇳', path: '/zh-Hans/' },
  { code: 'zh-Hant' as const, label: '繁體中文', flag: '🇹🇼', path: '/zh-Hant/' },
  { code: 'ja' as const, label: '日本語', flag: '🇯🇵', path: '/ja/' },
  { code: 'ko' as const, label: '한국어', flag: '🇰🇷', path: '/ko/' },
  { code: 'es' as const, label: 'Español', flag: '🇪🇸', path: '/es/' },
  { code: 'pt' as const, label: 'Português', flag: '🇧🇷', path: '/pt/' },
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷', path: '/fr/' },
  { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪', path: '/de/' },
  { code: 'ru' as const, label: 'Русский', flag: '🇷🇺', path: '/ru/' },
  { code: 'it' as const, label: 'Italiano', flag: '🇮🇹', path: '/it/' },
  { code: 'nl' as const, label: 'Nederlands', flag: '🇳🇱', path: '/nl/' },
  { code: 'pl' as const, label: 'Polski', flag: '🇵🇱', path: '/pl/' },
]

export function LanguageToggle() {
  const { language } = useLanguageStore()
  const navigate = useNavigate()
  const current = languages.find((l) => l.code === language)

  const handleLanguageChange = (lang: typeof languages[number]) => {
    navigate(lang.path)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="text-xs">{current?.label}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang)}
            className="cursor-pointer"
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
            {language === lang.code && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

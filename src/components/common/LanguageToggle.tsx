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
  { code: 'sv' as const, label: 'Svenska', flag: '🇸🇪', path: '/sv/' },
  { code: 'he' as const, label: 'עברית', flag: '🇮🇱', path: '/he/' },
  { code: 'da' as const, label: 'Dansk', flag: '🇩🇰', path: '/da/' },
  { code: 'nb' as const, label: 'Norsk', flag: '🇳🇴', path: '/nb/' },
  { code: 'hi' as const, label: 'हिन्दी', flag: '🇮🇳', path: '/hi/' },
  { code: 'vi' as const, label: 'Tiếng Việt', flag: '🇻🇳', path: '/vi/' },
  { code: 'tr' as const, label: 'Türkçe', flag: '🇹🇷', path: '/tr/' },
  { code: 'id' as const, label: 'Indonesia', flag: '🇮🇩', path: '/id/' },
  { code: 'fi' as const, label: 'Suomi', flag: '🇫🇮', path: '/fi/' },
  { code: 'uk' as const, label: 'Українська', flag: '🇺🇦', path: '/uk/' },
  { code: 'ar' as const, label: 'العربية', flag: '🇸🇦', path: '/ar/' },
  { code: 'th' as const, label: 'ไทย', flag: '🇹🇭', path: '/th/' },
  { code: 'ro' as const, label: 'Română', flag: '🇷🇴', path: '/ro/' },
  { code: 'cs' as const, label: 'Čeština', flag: '🇨🇿', path: '/cs/' },
  { code: 'bn' as const, label: 'বাংলা', flag: '🇧🇩', path: '/bn/' },
  { code: 'el' as const, label: 'Ελληνικά', flag: '🇬🇷', path: '/el/' },
  { code: 'hu' as const, label: 'Magyar', flag: '🇭🇺', path: '/hu/' },
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

import { Globe, ChevronDown, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LANGUAGE_CONFIG, getLanguagePathname, useLanguageStore } from '@/i18n'

export function LanguageToggle() {
  const { language } = useLanguageStore()
  const navigate = useNavigate()
  const current = LANGUAGE_CONFIG.find((candidate) => candidate.code === language)

  const handleLanguageChange = (nextLanguage: typeof LANGUAGE_CONFIG[number]) => {
    navigate(getLanguagePathname(nextLanguage.code))
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
        {LANGUAGE_CONFIG.map((languageOption) => (
          <DropdownMenuItem
            key={languageOption.code}
            onClick={() => handleLanguageChange(languageOption)}
            className="cursor-pointer"
          >
            <span className="mr-2">{languageOption.flag}</span>
            {languageOption.label}
            {language === languageOption.code && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

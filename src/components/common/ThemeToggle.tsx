import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/themeStore'

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  const cycleTheme = () => {
    const themeOrder: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themeOrder.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="gap-1.5"
      aria-label={`Current theme: ${getLabel()}. Click to change.`}
    >
      {getIcon()}
      <span className="hidden sm:inline text-xs">{getLabel()}</span>
    </Button>
  )
}

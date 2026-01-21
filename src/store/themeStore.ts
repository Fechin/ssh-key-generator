import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('ssh-key-generator-theme')
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme
    }
  } catch {
    // Ignore localStorage errors
  }
  return 'system'
}

const applyTheme = (theme: Theme): 'light' | 'dark' => {
  const resolved = theme === 'system' ? getSystemTheme() : theme

  // Use class-based dark mode
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // Update color-scheme for scrollbar and native elements
  document.documentElement.style.colorScheme = resolved

  // Update meta theme-color for mobile browsers
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', resolved === 'dark' ? 'hsl(224 0% 4%)' : 'hsl(0 0% 100%)')
  }

  return resolved
}

const initialTheme = getStoredTheme()
const initialResolved = applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,

  setTheme: (theme) => {
    const resolved = applyTheme(theme)
    set({ theme, resolvedTheme: resolved })

    try {
      localStorage.setItem('ssh-key-generator-theme', theme)
    } catch {
      // Ignore localStorage errors
    }
  }
}))

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      const resolved = getSystemTheme()
      applyTheme('system')
      useThemeStore.setState({ resolvedTheme: resolved })
    }
  })
}

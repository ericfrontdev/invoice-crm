'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<
  ThemeProviderContextType | undefined
>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    // Check for theme in URL params (from landing page)
    const urlParams = new URLSearchParams(window.location.search)
    const urlTheme = urlParams.get('theme')
    if (urlTheme === 'dark' || urlTheme === 'light') {
      localStorage.setItem(storageKey, urlTheme)
      setTheme(urlTheme)
      // Clean URL
      urlParams.delete('theme')
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname
      window.history.replaceState({}, '', newUrl)
      return
    }

    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

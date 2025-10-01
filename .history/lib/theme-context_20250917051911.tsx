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
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])
}

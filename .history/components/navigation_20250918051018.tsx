'use client'

import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor } from 'lucide-react'
import Link from 'next/link'

export function Navigation() {
  const { theme, setTheme } = useTheme()

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Invoice Manager</h1>
          </div>

          {/* NavigationLinks */}
          <div>
            <div>
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/clients"
                className="px-3 py-2 text-sm font-medium"
              >
                Clients
              </Link>
              <Link
                href="/invoices"
                className="px-3 py-2 text-sm font-medium"
              >
                Invoices
              </Link>
            </div>
          </div>

          {/* ThemeToggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (theme === 'light') setTheme('dark')
              else if (theme === 'dark') setTheme('system')
              else setTheme('light')
            }}
          >
            {theme === 'light' && <Sun className="h-4 w-4" />}
            {theme === 'dark' && <Moon className="h-4 w-4" />}
            {theme === 'system' && <Monitor className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </nav>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'

export function Navigation({
  user,
  isSuperAdmin,
}: {
  user?: { name: string; email: string; image?: string | null }
  isSuperAdmin?: boolean
}) {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">Invoice Manager</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  href="/clients"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md"
                >
                  Clients
                </Link>
                <Link
                  href="/invoices"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md"
                >
                  Factures
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Invoice Manager</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md"
                >
                  Dashboard
                </Link>
                <Link
                  href="/clients"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md"
                >
                  Clients
                </Link>
                <Link
                  href="/invoices"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md"
                >
                  Factures
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
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

            {user && <UserMenu user={user} isSuperAdmin={isSuperAdmin || false} />}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/clients"
                className="block px-3 py-2 text-base font-medium hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Clients
              </Link>
              <Link
                href="/invoices"
                className="block px-3 py-2 text-base font-medium hover:bg-accent rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Factures
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

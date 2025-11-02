'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()

  const switchLanguage = (locale: 'en' | 'fr') => {
    // Remove current locale from pathname if present
    let newPathname = pathname
    if (pathname.startsWith('/en')) {
      newPathname = pathname.replace(/^\/en/, '')
    } else if (pathname.startsWith('/fr')) {
      newPathname = pathname.replace(/^\/fr/, '')
    }

    // Add new locale prefix if not French (default)
    const targetPath = locale === 'en' ? `/en${newPathname || '/'}` : newPathname || '/'

    router.push(targetPath)
  }

  // Detect current locale from pathname
  const currentLocale = pathname.startsWith('/en') ? 'en' : 'fr'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => switchLanguage('fr')}
          className={currentLocale === 'fr' ? 'bg-accent' : ''}
        >
          🇫🇷 Français
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLanguage('en')}
          className={currentLocale === 'en' ? 'bg-accent' : ''}
        >
          🇨🇦 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

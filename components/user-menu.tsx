'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Shield, User, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FeedbackBadge } from '@/components/feedback-badge'
import { UserNotificationBadge } from '@/components/user-notification-badge'
import { useTranslation } from '@/lib/i18n-context'

export function UserMenu({
  user,
  isSuperAdmin,
  onProfileClick,
  isMobile = false,
}: {
  user: { name: string; email: string; image?: string | null }
  isSuperAdmin: boolean
  onProfileClick?: () => void
  isMobile?: boolean
}) {
  const { t } = useTranslation()

  // Version mobile - affichage simple sans dropdown
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center text-white text-sm font-medium flex-shrink-0">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-1">
          <Link
            href="/profil"
            className="flex items-center gap-3 px-3 py-2 text-base font-medium hover:bg-accent rounded-md"
            onClick={onProfileClick}
          >
            <User className="h-5 w-5" />
            <span>{t('nav.profile')}</span>
          </Link>

          {isSuperAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 text-base font-medium hover:bg-accent rounded-md"
              onClick={onProfileClick}
            >
              <Shield className="h-5 w-5" />
              <span>{t('nav.admin')}</span>
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="flex items-center gap-3 px-3 py-2 text-base font-medium hover:bg-accent rounded-md w-full text-left text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    )
  }

  // Version desktop - dropdown menu
  return (
    <div className="flex items-center gap-3">
      {isSuperAdmin && <FeedbackBadge isSuperAdmin={isSuperAdmin} />}

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity rounded-md outline-none">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center text-white text-xs font-medium flex-shrink-0">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/profil"
                className="cursor-pointer"
                onClick={onProfileClick}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{t('nav.profile')}</span>
              </Link>
            </DropdownMenuItem>
            {isSuperAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>{t('nav.admin')}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('nav.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {!isSuperAdmin && <UserNotificationBadge />}
      </div>
    </div>
  )
}

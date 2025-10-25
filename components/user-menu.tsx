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
import Link from 'next/link'
import { FeedbackBadge } from '@/components/feedback-badge'

export function UserMenu({
  user,
  isSuperAdmin,
  onProfileClick,
}: {
  user: { name: string; email: string; image?: string | null }
  isSuperAdmin: boolean
  onProfileClick?: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      {isSuperAdmin && <FeedbackBadge isSuperAdmin={isSuperAdmin} />}

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
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
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
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          {isSuperAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

'use client'

import { signOut } from 'next-auth/react'
import { LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      {isSuperAdmin && (
        <>
          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
          <FeedbackBadge isSuperAdmin={isSuperAdmin} />
        </>
      )}

      <Link
        href="/profil"
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity rounded-md"
        onClick={onProfileClick}
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center text-white text-xs font-medium flex-shrink-0">
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
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: '/auth/login' })}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

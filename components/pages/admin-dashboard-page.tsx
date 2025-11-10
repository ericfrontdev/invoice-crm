'use client'

import { useTranslation } from '@/lib/i18n-context'
import { AlertCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

type User = {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  plan: string | null
  paymentMethod: string | null
  createdAt: Date
  isSuperAdmin: boolean
}

export function AdminDashboardPage({ users }: { users: User[] }) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('admin.dashboardTitle')}</h1>
          <p className="text-muted-foreground">
            {t('admin.platformUsersInfo')}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/admin/feedback">
            <Button variant="outline">
              {t('admin.feedback')}
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              {t('common.settings')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t('admin.noUsers')}</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">{`${t('admin.users')} (${users.length})`}</h2>
          </div>
          <AdminUsersTable users={users} />
        </div>
      )}
    </div>
  )
}

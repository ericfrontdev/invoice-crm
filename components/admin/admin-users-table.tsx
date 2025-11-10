'use client'

import { useTranslation } from '@/lib/i18n-context'

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

export function AdminUsersTable({ users }: { users: User[] }) {
  const { t, locale } = useTranslation()

  const getPlanBadgeClass = (plan: string | null) => {
    if (plan === 'owner') {
      return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-300 dark:from-amber-400/10 dark:to-yellow-400/10 dark:text-amber-300 dark:border-amber-300/20'
    } else if (plan === 'premium') {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-300/20'
    } else if (plan === 'pro') {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-300/20'
    }
    return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-400/10 dark:text-gray-300 dark:border-gray-300/20'
  }

  return (
    <>
      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4 p-4">
        {users.map((user) => (
          <div key={user.id} className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center text-white text-sm font-medium shrink-0">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
              {user.isSuperAdmin && (
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border-red-200 dark:bg-red-400/10 dark:text-red-300 dark:border-red-300/20">
                  Admin
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {user.company && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('clients.company')}:</span>
                  <span className="font-medium">{user.company}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('clients.phone')}:</span>
                  <span className="font-medium">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t('admin.plan')}:</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getPlanBadgeClass(user.plan)}`}>
                  {user.plan || 'free'}
                </span>
              </div>
              {user.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('admin.payment')}:</span>
                  <span className="font-medium">{user.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('admin.registeredOn')}:</span>
                <span className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-3 px-4">{t('clients.name')}</th>
            <th className="hidden md:table-cell text-left py-3 px-4">{t('clients.company')}</th>
            <th className="text-left py-3 px-4">{t('clients.email')}</th>
            <th className="hidden lg:table-cell text-left py-3 px-4">{t('clients.phone')}</th>
            <th className="hidden xl:table-cell text-left py-3 px-4">{t('clients.address')}</th>
            <th className="text-left py-3 px-4">{t('admin.plan')}</th>
            <th className="hidden lg:table-cell text-left py-3 px-4">{t('admin.payment')}</th>
            <th className="hidden md:table-cell text-left py-3 px-4">{t('admin.registeredOn')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t hover:bg-muted/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center text-white text-xs font-medium">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {user.isSuperAdmin && (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border-red-200 dark:bg-red-400/10 dark:text-red-300 dark:border-red-300/20">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="hidden md:table-cell py-3 px-4">{user.company || '-'}</td>
              <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
              <td className="hidden lg:table-cell py-3 px-4">{user.phone || '-'}</td>
              <td className="hidden xl:table-cell py-3 px-4">{user.address || '-'}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                  user.plan === 'owner'
                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-300 dark:from-amber-400/10 dark:to-yellow-400/10 dark:text-amber-300 dark:border-amber-300/20'
                    : user.plan === 'premium'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-300/20'
                    : user.plan === 'pro'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-300/20'
                    : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-400/10 dark:text-gray-300 dark:border-gray-300/20'
                }`}>
                  {user.plan || 'free'}
                </span>
              </td>
              <td className="hidden lg:table-cell py-3 px-4">{user.paymentMethod || '-'}</td>
              <td className="hidden md:table-cell py-3 px-4 text-sm text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  )
}

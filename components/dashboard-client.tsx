'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Users,
  FolderOpen,
  FileText,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type OverdueItem = {
  id: string
  number: string
  total: number
  dueDate: Date | null
  client: {
    id: string
    name: string
  }
}

type TopClient = {
  id: string
  name: string
  total: number
}

type DashboardClientProps = {
  totalDue: number
  overdue: OverdueItem[]
  counts: {
    drafts: number
    sent: number
    paid: number
  }
  topClients: TopClient[]
}

export function DashboardClient({
  totalDue,
  overdue,
  counts,
  topClients,
}: DashboardClientProps) {
  const { t } = useTranslation()

  const maxTop = topClients.length
    ? Math.max(...topClients.map((c) => c.total))
    : 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero section */}
      <div className="rounded-xl border overflow-hidden bg-gradient-to-r from-slate-900/5 to-sky-500/10 dark:from-slate-100/5 dark:to-sky-400/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span>{t('dashboard.totalDue')}</span>
            </div>
            <p className="text-4xl font-semibold tracking-tight">
              {totalDue.toFixed(2)} $
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {overdue.length > 0
                ? `${overdue.length} ${t('dashboard.overdueItems')}`
                : t('dashboard.noOverdue')}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/clients">
              <Button
                className="cursor-pointer"
                variant="outline"
              >
                + {t('dashboard.newClient')}
              </Button>
            </Link>
            <Link href="/invoices">
              <Button className="cursor-pointer">{t('dashboard.createInvoice')}</Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t">
          <div className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-md grid place-items-center bg-background border">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.drafts')}</p>
              <p className="text-lg font-medium">{counts.drafts}</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3 border-t sm:border-t-0 sm:border-l">
            <div className="h-9 w-9 rounded-md grid place-items-center bg-background border">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.sent')}</p>
              <p className="text-lg font-medium">{counts.sent}</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-3 border-t sm:border-t-0 sm:border-l">
            <div className="h-9 w-9 rounded-md grid place-items-center bg-background border">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('dashboard.paid')}</p>
              <p className="text-lg font-medium">{counts.paid}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accès rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/projets"
          className="group"
        >
          <div className="rounded-lg border p-6 hover:shadow-md transition-all duration-200 hover:border-primary/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md grid place-items-center bg-primary/10 text-primary">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {t('dashboard.allProjects')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.manageProjects')}
                </p>
              </div>
            </div>
          </div>
        </Link>
        <Link
          href="/invoices"
          className="group"
        >
          <div className="rounded-lg border p-6 hover:shadow-md transition-all duration-200 hover:border-primary/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md grid place-items-center bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {t('dashboard.allInvoices')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.manageInvoices')}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Deux colonnes distinctives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overdue panel */}
        <div className="rounded-xl border">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-semibold">{t('dashboard.toWatch')}</h2>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300 border border-amber-200/60 dark:border-amber-300/20">
              {overdue.length} {t('dashboard.overdue')}
            </span>
          </div>
          <div className="p-4">
            {overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('dashboard.nothingOverdue')}</p>
            ) : (
              <ul className="space-y-3">
                {overdue.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('dashboard.client')}{' '}
                        <Link
                          href={`/clients/${item.client.id}`}
                          className="underline"
                        >
                          {item.client.name}
                        </Link>{' '}
                        • {t('dashboard.dueDate')}:{' '}
                        <span className="text-red-600 dark:text-red-400">
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleDateString('fr-FR')
                            : '-'}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border-red-200 dark:bg-red-400/10 dark:text-red-300 dark:border-red-300/20">
                        {item.total.toFixed(2)} $
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top clients with bars */}
        <div className="rounded-xl border">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <h2 className="text-base font-semibold">{t('dashboard.topClientsDue')}</h2>
            </div>
            <span className="text-xs text-muted-foreground">{t('dashboard.shareOfTotal')}</span>
          </div>
          <div className="p-4">
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('dashboard.noDue')}</p>
            ) : (
              <ul className="space-y-4">
                {topClients.map((c) => {
                  const pct =
                    maxTop > 0
                      ? Math.max(8, Math.round((c.total / maxTop) * 100))
                      : 0
                  const initials = c.name
                    .split(' ')
                    .slice(0, 2)
                    .map((s) => s.charAt(0).toUpperCase())
                    .join('')
                  return (
                    <li key={c.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-full border grid place-items-center text-xs bg-background">
                            {initials}
                          </div>
                          <Link
                            href={`/clients/${c.id}`}
                            className="truncate hover:underline"
                          >
                            {c.name}
                          </Link>
                        </div>
                        <div className="text-sm font-medium shrink-0">
                          {c.total.toFixed(2)} $
                        </div>
                      </div>
                      <div className="h-2 w-full rounded bg-muted overflow-hidden border">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { TrendingUp, Calendar, ArrowUpRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type OverviewData = {
  recentTransactions: Array<{
    id: string
    number: string
    total: number
    createdAt: Date
    client: {
      id: string
      name: string
    }
    project: {
      name: string
    } | null
  }>
  revenueByMonth: Array<{
    date: Date
    amount: number
  }>
}

export function OverviewAccountingTab({ data }: { data: OverviewData }) {
  const { t, locale } = useTranslation()
  const maxMonthRevenue = Math.max(...data.revenueByMonth.map((m) => m.amount), 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique des revenus mensuels */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('accounting.revenuesLast6Months')}
        </h3>
        <div className="space-y-4">
          {data.revenueByMonth.map((item, index) => {
            const percentage = (item.amount / maxMonthRevenue) * 100
            const monthLabel = new Date(item.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{monthLabel}</span>
                  <span className="text-sm font-medium">{item.amount.toFixed(2)} $</span>
                </div>
                <div className="h-2 w-full rounded bg-muted overflow-hidden border">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('accounting.recentTransactions')}
        </h3>
        {data.recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('accounting.noTransactions')}
          </p>
        ) : (
          <div className="space-y-3">
            {data.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-3 text-sm border-b pb-3 last:border-b-0 last:pb-0"
              >
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-400/10 grid place-items-center flex-shrink-0">
                  <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{transaction.number}</p>
                  <p className="text-xs text-muted-foreground">
                    <Link
                      href={`/clients/${transaction.client.id}`}
                      className="hover:underline"
                    >
                      {transaction.client.name}
                    </Link>
                    {transaction.project && ` • ${transaction.project.name}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    +{transaction.total.toFixed(2)} $
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

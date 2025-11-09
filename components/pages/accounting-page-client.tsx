'use client'

import { AccountingView } from '@/components/accounting-view'
import { useTranslation } from '@/lib/i18n-context'

type AccountingData = {
  revenue: {
    monthProjects: number
    monthStandalone: number
    monthTotal: number
    year: number
  }
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
  allInvoices: Array<{
    id: string
    number: string
    total: number
    createdAt: Date
    client: {
      id: string
      name: string
    }
    project: {
      id: string
      name: string
    } | null
  }>
  manualRevenues: Array<{
    id: string
    description: string
    amount: number
    date: Date
    category: string | null
    userId: string
    createdAt: Date
  }>
  expenses: Array<{
    id: string
    description: string
    amount: number
    category: string | null
    date: Date
    userId: string
    createdAt: Date
  }>
}

type AccountingPageClientProps = {
  data: AccountingData
}

export function AccountingPageClient({ data }: AccountingPageClientProps) {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('accounting.title')}</h1>
          <p className="text-muted-foreground">
            {t('accounting.overviewDescription')}
          </p>
        </div>
      </div>

      {/* Vue avec onglets */}
      <AccountingView data={data} />
    </div>
  )
}

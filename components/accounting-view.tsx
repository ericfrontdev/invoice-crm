'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewAccountingTab } from '@/components/accounting/overview-tab'
import { RevenueTab } from '@/components/accounting/revenue-tab'
import { ExpensesTab } from '@/components/accounting/expenses-tab'
import { ReportsTab } from '@/components/accounting/reports-tab'
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
  }>
  expenses: Array<{
    id: string
    description: string
    amount: number
    date: Date
    category: string | null
  }>
}

export function AccountingView({ data }: { data: AccountingData }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-8">
      {/* Métriques principales - toujours visibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenus projets du mois */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-400/10 grid place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600 dark:text-green-400"
                >
                  <path d="m7 7 10 10-5 5V2l5 5L7 17" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">{t('accounting.thisMonth')}</span>
            </div>
          </div>
          <p className="text-3xl font-bold">{data.revenue.monthProjects.toFixed(2)} $</p>
          <p className="text-xs text-muted-foreground mt-1">{t('accounting.projectRevenue')}</p>
        </div>

        {/* Revenus ponctuels du mois */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-400/10 grid place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600 dark:text-blue-400"
                >
                  <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
                  <path d="M16 7h6v6" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">{t('accounting.thisMonth')}</span>
            </div>
          </div>
          <p className="text-3xl font-bold">{data.revenue.monthStandalone.toFixed(2)} $</p>
          <p className="text-xs text-muted-foreground mt-1">{t('accounting.standaloneRevenue')}</p>
        </div>

        {/* Total revenus du mois */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-400/10 grid place-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600 dark:text-purple-400"
                >
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">{t('accounting.thisMonth')}</span>
            </div>
          </div>
          <p className="text-3xl font-bold">{data.revenue.monthTotal.toFixed(2)} $</p>
          <p className="text-xs text-muted-foreground mt-1">{t('accounting.totalMonthRevenue')}</p>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('accounting.overview')}</TabsTrigger>
          <TabsTrigger value="revenue">{t('accounting.revenues')}</TabsTrigger>
          <TabsTrigger value="expenses">{t('accounting.expenses')}</TabsTrigger>
          <TabsTrigger value="reports">{t('accounting.reports')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewAccountingTab data={data} />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueTab invoices={data.allInvoices} manualRevenues={data.manualRevenues} />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpensesTab expenses={data.expenses} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsTab data={{
            revenue: {
              month: data.revenue.monthTotal,
              year: data.revenue.year,
              total: data.revenue.year
            },
            expenses: data.expenses,
            allInvoices: data.allInvoices
          }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

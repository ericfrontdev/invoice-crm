'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ReportsData = {
  revenue: {
    month: number
    year: number
    total: number
  }
  expenses: Array<{
    id: string
    description: string
    amount: number
    date: Date
    category: string | null
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
  }>
}

export function ReportsTab({ data }: { data: ReportsData }) {
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profitYear = data.revenue.year - totalExpenses
  const profitMargin = data.revenue.year > 0 ? (profitYear / data.revenue.year) * 100 : 0

  // Revenus par client
  const revenueByClient = data.allInvoices.reduce((acc, invoice) => {
    const clientId = invoice.client.id
    if (!acc[clientId]) {
      acc[clientId] = {
        name: invoice.client.name,
        total: 0,
      }
    }
    acc[clientId].total += invoice.total
    return acc
  }, {} as Record<string, { name: string; total: number }>)

  const topClients = Object.values(revenueByClient)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Dépenses par catégorie
  const expensesByCategory = data.expenses.reduce((acc, expense) => {
    const category = expense.category || 'Non catégorisé'
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += expense.amount
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const handleExportCSV = () => {
    const csvData = [
      ['Type', 'Description', 'Montant', 'Date', 'Client/Catégorie'],
      ...data.allInvoices.map(inv => [
        'Revenu',
        `Facture ${inv.number}`,
        inv.total.toFixed(2),
        new Date(inv.createdAt).toLocaleDateString('fr-FR'),
        inv.client.name,
      ]),
      ...data.expenses.map(exp => [
        'Dépense',
        exp.description,
        exp.amount.toFixed(2),
        new Date(exp.date).toLocaleDateString('fr-FR'),
        exp.category || '-',
      ]),
    ]

    const csv = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Bilan financier */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Bilan Financier</h3>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-300/20">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Revenus annuels</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{data.revenue.year.toFixed(2)} $</p>
          </div>

          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-300/20">
            <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">Dépenses annuelles</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{totalExpenses.toFixed(2)} $</p>
          </div>

          <div className={`p-4 rounded-lg border ${profitYear >= 0 ? 'bg-blue-50 dark:bg-blue-400/10 border-blue-200 dark:border-blue-300/20' : 'bg-orange-50 dark:bg-orange-400/10 border-orange-200 dark:border-orange-300/20'}`}>
            <p className={`text-sm font-medium mb-1 ${profitYear >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
              Profit net
            </p>
            <p className={`text-2xl font-bold ${profitYear >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-orange-100'}`}>
              {profitYear.toFixed(2)} $
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              Marge: {profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Clients */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Top 5 Clients par Revenus</h3>
        {topClients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun client avec revenus</p>
        ) : (
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium">{client.name}</span>
                </div>
                <span className="font-bold">{client.total.toFixed(2)} $</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top 5 Catégories de dépenses */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Top 5 Catégories de Dépenses</h3>
        {topCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucune dépense enregistrée</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map(([category, amount], index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-400/10 grid place-items-center text-purple-700 dark:text-purple-300 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium">{category}</span>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">{amount.toFixed(2)} $</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rapport fiscal annuel */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Résumé Fiscal Annuel</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Revenus bruts</span>
            <span className="font-semibold">{data.revenue.year.toFixed(2)} $</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Dépenses déductibles</span>
            <span className="font-semibold">-{totalExpenses.toFixed(2)} $</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Revenu net imposable</span>
            <span className="font-bold text-lg">{profitYear.toFixed(2)} $</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Ces chiffres sont à titre indicatif. Consultez un comptable pour votre déclaration fiscale officielle.
          </p>
        </div>
      </div>
    </div>
  )
}

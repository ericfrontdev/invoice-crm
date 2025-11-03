'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ExpenseModal } from '@/components/expense-modal'
import { ExpenseCard } from '@/components/accounting/expense-card'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n-context'

type Expense = {
  id: string
  description: string
  amount: number
  date: Date
  category: string | null
}

export function ExpensesTab({ expenses }: { expenses: Expense[] }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCreate = () => {
    setSelectedExpense(null)
    setIsModalOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('accounting.areYouSureDeleteExpense'))) return

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error(t('accounting.deleteErrorExpense'))

      router.refresh()
    } catch (_error) {
      alert(t('accounting.deleteExpenseError'))
    }
  }

  const handleSave = async (data: {
    description: string
    amount: number
    date: string
    category: string | null
  }) => {
    try {
      if (selectedExpense) {
        // Update
        const res = await fetch(`/api/expenses/${selectedExpense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!res.ok) throw new Error(t('accounting.updateError'))
      } else {
        // Create
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!res.ok) throw new Error(t('accounting.createError'))
      }

      setIsModalOpen(false)
      router.refresh()
    } catch (_error) {
      alert(t('accounting.saveExpenseError'))
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header avec total */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{t('accounting.totalExpensesAmount')}</h3>
            <p className="text-3xl font-bold mt-2">{totalExpenses.toFixed(2)} $</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t('accounting.newExpense')}
          </Button>
        </div>
      </div>

      {/* Liste des dépenses / Cartes mobile */}
      <div className="bg-card rounded-lg border">
        {expenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">{t('accounting.noExpensesRecorded')}</p>
            <Button onClick={handleCreate} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {t('accounting.addAnExpense')}
            </Button>
          </div>
        ) : isMobile ? (
          /* Mobile: Card view */
          <div className="p-4 space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Desktop: Table view */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">{t('common.date')}</th>
                  <th className="text-left py-3 px-4">{t('common.description')}</th>
                  <th className="text-left py-3 px-4">{t('common.category')}</th>
                  <th className="text-right py-3 px-4">{t('common.amount')}</th>
                  <th className="text-right py-3 px-4">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4">
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-medium">{expense.description}</td>
                    <td className="py-3 px-4">
                      {expense.category ? (
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-300/20">
                          {expense.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-red-600 dark:text-red-400">
                      -{expense.amount.toFixed(2)} $
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        expense={selectedExpense}
      />
    </div>
  )
}

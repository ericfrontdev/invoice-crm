'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/lib/i18n-context'

type Expense = {
  id: string
  description: string
  amount: number
  date: Date
  category: string | null
}

export function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { description: string; amount: number; date: string; category: string | null }) => Promise<void>
  expense: Expense | null
}) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        date: new Date(expense.date).toISOString().split('T')[0],
        category: expense.category || '',
      })
    } else {
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
      })
    }
  }, [expense, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category || null,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {expense ? t('accounting.editExpenseTitle') : t('accounting.newExpenseTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description" className="mb-2 block">{t('common.description')} *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="amount" className="mb-2 block">{t('common.amount')} *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="date" className="mb-2 block">{t('common.date')} *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="category" className="mb-2 block">{t('common.category')}</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder={t('accounting.exOfficeTravelMarketing')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {expense ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

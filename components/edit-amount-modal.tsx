'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type EditAmountData = {
  amount: number
  description: string
  date: string
  dueDate?: string
}

type UnpaidAmount = {
  id: string
  amount: number
  description: string
  date: Date
  dueDate: Date | null
  status: string
}

export function EditAmountModal({
  isOpen,
  onClose,
  onSubmit,
  amount,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EditAmountData) => void
  amount: UnpaidAmount | null
}) {
  const [formData, setFormData] = useState<EditAmountData>({
    amount: 0,
    description: '',
    date: '',
    dueDate: '',
  })

  useEffect(() => {
    if (amount) {
      setFormData({
        amount: amount.amount,
        description: amount.description,
        date: new Date(amount.date).toISOString().split('T')[0],
        dueDate: amount.dueDate
          ? new Date(amount.dueDate).toISOString().split('T')[0]
          : '',
      })
    }
  }, [amount])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen || !amount) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-black/50 overlay-blur" onClick={onClose} />

      <div className="relative bg-background border rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <h2 className="text-lg font-semibold">Modifier le montant dû</h2>
          <button className="text-sm underline" onClick={onClose}>
            Fermer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Montant ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Date d&apos;échéance</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Annuler
            </Button>
            <Button type="submit" className="cursor-pointer">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Loader2 } from 'lucide-react'

export interface NewAmountData {
  amount: number
  description: string
  date: string // ISO (yyyy-mm-dd)
  dueDate?: string | null // ISO
}

interface AddAmountModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: NewAmountData) => void
}

export function AddAmountModal({ isOpen, onClose, onSubmit }: AddAmountModalProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const defaultDue = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  }, [])
  type FormState = { amount: string; description: string; date: string; dueDate?: string | null }
  const [form, setForm] = useState<FormState>({ amount: '', description: '', date: today, dueDate: defaultDue })

  const [errors, setErrors] = useState<{ amount?: string; description?: string }>(
    {},
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen) return null

  const validate = () => {
    const e: typeof errors = {}
    if (form.amount === '' || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      e.amount = 'Le montant doit être supérieur à 0'
    }
    if (!form.description.trim()) {
      e.description = 'La description est requise'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    try {
      setIsSubmitting(true)
      await Promise.resolve(
        onSubmit({
          amount: Number(form.amount),
          description: form.description.trim(),
          date: form.date,
          dueDate: form.dueDate ? form.dueDate : null,
        }),
      )
      onClose()
      setForm({ amount: '', description: '', date: today, dueDate: defaultDue })
      setErrors({})
    } finally {
      setIsSubmitting(false)
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-amount-title"
    >
      <div className="fixed inset-0 bg-black/50 overlay-blur" onClick={onClose} />

      <div className="relative bg-background border rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <h2 id="add-amount-title" className="text-base font-semibold">
            Ajouter un montant dû
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="cursor-pointer">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Montant *</Label>
              <Input
                id="amount"
                inputMode="decimal"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                onFocus={(e) => {
                  // Sélectionner le contenu si présent (capture avant RAF)
                  const el = e.currentTarget
                  requestAnimationFrame(() => {
                    try {
                      el?.select()
                    } catch {}
                  })
                }}
                className="no-spinner"
                disabled={isSubmitting}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-xs text-red-600">{errors.amount}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={isSubmitting}
              placeholder="Ex: Consultation développement web"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Date d'échéance (optionnelle)</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate ?? ''}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> En cours…
                </span>
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

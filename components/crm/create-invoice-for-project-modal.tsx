'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type Project = {
  id: string
  name: string
}

type Client = {
  id: string
  name: string
}

type InvoiceItem = {
  description: string
  amount: string
}

export function CreateInvoiceForProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
  client,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (items: { description: string; amount: number }[], dueDate: string) => Promise<void>
  project?: Project | null
  client?: Client | null
}) {
  const { t } = useTranslation()
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', amount: '' },
  ])
  const [dueDate, setDueDate] = useState<string>('')

  // Réinitialiser les items et calculer la date d'échéance quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setItems([{ description: '', amount: '' }])
      // Calculer la date d'échéance par défaut : aujourd'hui + 30 jours
      const defaultDueDate = new Date()
      defaultDueDate.setDate(defaultDueDate.getDate() + 30)
      setDueDate(defaultDueDate.toISOString().split('T')[0])
    }
  }, [isOpen])

  const addItem = () => {
    setItems([...items, { description: '', amount: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length === 1) return // Garder au moins un item
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'description' | 'amount', value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Filtrer les items vides et convertir les montants en nombres
    const validItems = items
      .filter((item) => item.description.trim() && item.amount.trim())
      .map((item) => ({
        description: item.description.trim(),
        amount: parseFloat(item.amount),
      }))

    if (validItems.length === 0 || !dueDate) return

    await onSave(validItems, dueDate)

    // Réinitialiser
    setItems([{ description: '', amount: '' }])
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 30)
    setDueDate(defaultDueDate.toISOString().split('T')[0])
  }

  const handleClose = () => {
    setItems([{ description: '', amount: '' }])
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 30)
    setDueDate(defaultDueDate.toISOString().split('T')[0])
    onClose()
  }

  const total = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0
    return sum + amount
  }, 0)

  const modalTitle = project
    ? `${t('invoices.createInvoice')} - ${project.name}`
    : client
    ? `${t('invoices.createInvoice')} - ${client.name}`
    : t('invoices.createInvoice')

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('invoices.billingItems')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('invoices.addItem')}
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 p-3 border rounded-lg md:grid md:grid-cols-[1fr_140px_auto] md:gap-2 md:items-start md:p-0 md:border-0 md:rounded-none"
              >
                <div className="w-full">
                  <Label className="text-xs text-muted-foreground mb-1 block md:hidden">
                    {t('common.description')}
                  </Label>
                  <Textarea
                    placeholder={t('invoices.workDescriptionPlaceholder')}
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                    required
                  />
                </div>
                <div className="w-full md:w-auto">
                  <Label className="text-xs text-muted-foreground mb-1 block md:hidden">
                    {t('invoices.amount')}
                  </Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t('invoices.amount')}
                      value={item.amount}
                      onChange={(e) => updateItem(index, 'amount', e.target.value)}
                      required
                      className="flex-1 md:flex-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="cursor-pointer text-destructive disabled:cursor-not-allowed md:hidden"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="cursor-pointer text-destructive disabled:cursor-not-allowed hidden md:block"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{t('invoices.dueDate')}</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('invoices.defaultDueDate')}
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('invoices.total')}</p>
                <p className="text-2xl font-bold">{total.toFixed(2)} $</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('invoices.createInvoice')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

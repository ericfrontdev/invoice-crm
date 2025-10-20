'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

type Project = {
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
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (items: { description: string; amount: number }[]) => Promise<void>
  project: Project | null
}) {
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', amount: '' },
  ])

  // Réinitialiser les items quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setItems([{ description: '', amount: '' }])
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

    if (validItems.length === 0) return

    await onSave(validItems)

    // Réinitialiser
    setItems([{ description: '', amount: '' }])
  }

  const handleClose = () => {
    setItems([{ description: '', amount: '' }])
    onClose()
  }

  const total = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0
    return sum + amount
  }, 0)

  if (!project) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une facture - {project.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items de facturation</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un item
              </Button>
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_140px_auto] gap-2 items-start"
              >
                <div>
                  <Textarea
                    placeholder="Description du travail effectué"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Montant"
                    value={item.amount}
                    onChange={(e) => updateItem(index, 'amount', e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="cursor-pointer text-destructive disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{total.toFixed(2)} $</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit">
              Créer la facture
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

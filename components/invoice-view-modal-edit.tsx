'use client'

import { createPortal } from 'react-dom'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Save, X, Plus, Trash2, FileDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { InvoicePDFTemplate } from '@/components/invoice-pdf-template'
import { useReactToPrint } from 'react-to-print'

type InvoiceClient = {
  id: string
  name: string | null
  company?: string | null
  email?: string | null
  address?: string | null
}

type InvoiceItem = {
  id: string
  description: string
  amount: number
  date: string | Date
  dueDate?: string | Date | null
}

type User = {
  name: string
  company: string | null
  address: string | null
  phone: string | null
  email: string
  neq: string | null
  tpsNumber: string | null
  tvqNumber: string | null
  logo: string | null
}

type InvoiceForView = {
  id: string
  number: string
  status: 'draft' | 'sent' | 'paid' | string
  subtotal: number
  tps: number
  tvq: number
  total: number
  createdAt: string | Date
  dueDate?: string | Date | null
  client: InvoiceClient | null
  items?: InvoiceItem[]
  user?: User
}

export function InvoiceViewModal({
  isOpen,
  onClose,
  invoice,
}: {
  isOpen: boolean
  onClose: () => void
  invoice: InvoiceForView | null
}) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedStatus, setEditedStatus] = useState('')
  const [editedItems, setEditedItems] = useState<InvoiceItem[]>([])
  const [editedCreatedAt, setEditedCreatedAt] = useState('')
  const [editedDueDate, setEditedDueDate] = useState('')
  const pdfRef = useRef<HTMLDivElement>(null)

  // Déterminer si les taxes sont chargées (si tps ou tvq > 0)
  const hasTaxes = invoice && (invoice.tps > 0 || invoice.tvq > 0)

  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: `Facture-${invoice?.number || 'document'}`,
  })

  useEffect(() => {
    if (invoice) {
      setEditedStatus(invoice.status)
      setEditedItems(invoice.items || [])
      // Format dates for input[type="date"] (YYYY-MM-DD)
      setEditedCreatedAt(new Date(invoice.createdAt).toISOString().split('T')[0])
      setEditedDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '')
    }
  }, [invoice])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEditing) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, isEditing])

  if (!isOpen || !invoice) return null

  const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(new Date(d))
  const created = new Date(invoice.createdAt)

  const handleSave = async () => {
    setSaving(true)
    try {
      // API will calculate taxes automatically
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editedStatus,
          items: editedItems,
          createdAt: editedCreatedAt ? new Date(editedCreatedAt).toISOString() : undefined,
          dueDate: editedDueDate ? new Date(editedDueDate).toISOString() : null,
        }),
      })

      if (res.ok) {
        setIsEditing(false)
        router.refresh()
        onClose()
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const addItem = () => {
    setEditedItems([
      ...editedItems,
      {
        id: `temp-${Date.now()}`,
        description: '',
        amount: 0,
        date: new Date().toISOString(),
      },
    ])
  }

  const removeItem = (id: string) => {
    setEditedItems(editedItems.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setEditedItems(
      editedItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-black/50 overlay-blur" onClick={isEditing ? undefined : onClose} />

      <div className="relative bg-background border rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-3 md:px-6 py-3 md:py-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <h2 className="text-sm md:text-base font-semibold truncate">Facture {invoice.number}</h2>
          <div className="flex items-center gap-1 md:gap-2">
            {!isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handlePrint} className="px-2 md:px-3">
                  <FileDown className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Télécharger PDF</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="px-2 md:px-3">
                  <Edit2 className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Modifier</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="px-2 md:px-3">
                  <X className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Fermer</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false)
                    setEditedStatus(invoice.status)
                    setEditedItems(invoice.items || [])
                    setEditedCreatedAt(new Date(invoice.createdAt).toISOString().split('T')[0])
                    setEditedDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '')
                  }}
                  disabled={saving}
                  className="px-2 md:px-3"
                >
                  <X className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Annuler</span>
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="px-2 md:px-3">
                  <Save className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mode Aperçu - Affiche le vrai template de facture */}
        {!isEditing && invoice.user && (
          <div className="p-6">
            <InvoicePDFTemplate
              ref={pdfRef}
              invoice={{
                id: invoice.id,
                number: invoice.number,
                status: invoice.status,
                subtotal: invoice.subtotal,
                tps: invoice.tps,
                tvq: invoice.tvq,
                total: invoice.total,
                createdAt: new Date(invoice.createdAt),
                client: {
                  name: invoice.client?.name || '',
                  company: invoice.client?.company || null,
                  email: invoice.client?.email || '',
                  address: invoice.client?.address || null,
                },
                items: (invoice.items || []).map(item => ({
                  description: item.description,
                  amount: item.amount,
                  date: new Date(item.date),
                  dueDate: item.dueDate ? new Date(item.dueDate) : null,
                })),
              }}
              user={invoice.user}
            />
          </div>
        )}

        {/* Mode Édition - Affiche les champs éditables */}
        {isEditing && (
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Facture</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">Statut:</p>
                {isEditing ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="draft">draft</option>
                    <option value="sent">sent</option>
                    <option value="paid">paid</option>
                  </select>
                ) : (
                  <span className="text-sm">{invoice.status}</span>
                )}
              </div>

              {/* Créée le - éditable */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">Créée le:</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedCreatedAt}
                    onChange={(e) => setEditedCreatedAt(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                ) : (
                  <span className="text-sm">{formatDate(created)}</span>
                )}
              </div>

              {/* Échéance - éditable */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">Échéance:</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  />
                ) : (
                  <span className="text-sm">
                    {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-1">Numéro: {invoice.number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Destinataire</p>
              <p className="font-medium">{invoice.client?.name ?? 'Client'}</p>
              {invoice.client?.company && <p className="text-sm">{invoice.client.company}</p>}
              {invoice.client?.address && <p className="text-sm">{invoice.client.address}</p>}
              {invoice.client?.email && <p className="text-sm">{invoice.client.email}</p>}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border mb-6">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Montant</th>
                  {isEditing && <th className="text-right py-3 px-4"></th>}
                </tr>
              </thead>
              <tbody>
                {editedItems.length > 0 ? (
                  editedItems.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => updateItem(it.id, 'description', e.target.value)}
                            className="w-full border rounded px-2 py-1"
                          />
                        ) : (
                          it.description
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {it.date ? formatDate(it.date) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={it.amount}
                            onChange={(e) => updateItem(it.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-24 border rounded px-2 py-1 text-right"
                          />
                        ) : (
                          `${Number(it.amount).toFixed(2)} $`
                        )}
                      </td>
                      {isEditing && (
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600"
                            onClick={() => removeItem(it.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td className="py-3 px-4 text-center text-muted-foreground" colSpan={isEditing ? 4 : 3}>
                      Aucun élément détaillé
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                {isEditing && (
                  <tr>
                    <td colSpan={4} className="py-2 px-4">
                      <Button variant="outline" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un élément
                      </Button>
                    </td>
                  </tr>
                )}
                {/* Sous-total (toujours affiché si taxes) */}
                {hasTaxes && (
                  <tr>
                    <td className="py-2 px-4" colSpan={isEditing ? 3 : 2}>
                      <span className="text-sm text-muted-foreground">Sous-total</span>
                    </td>
                    <td className="py-2 px-4 text-right" colSpan={isEditing ? 2 : 1}>
                      {Number(
                        isEditing
                          ? editedItems.reduce((sum, item) => sum + Number(item.amount), 0)
                          : invoice.subtotal
                      ).toFixed(2)}{' '}
                      $
                    </td>
                  </tr>
                )}
                {/* TPS */}
                {hasTaxes && (
                  <tr>
                    <td className="py-2 px-4" colSpan={isEditing ? 3 : 2}>
                      <span className="text-sm text-muted-foreground">TPS (5%)</span>
                    </td>
                    <td className="py-2 px-4 text-right" colSpan={isEditing ? 2 : 1}>
                      {Number(
                        isEditing
                          ? editedItems.reduce((sum, item) => sum + Number(item.amount), 0) * 0.05
                          : invoice.tps
                      ).toFixed(2)}{' '}
                      $
                    </td>
                  </tr>
                )}
                {/* TVQ */}
                {hasTaxes && (
                  <tr>
                    <td className="py-2 px-4" colSpan={isEditing ? 3 : 2}>
                      <span className="text-sm text-muted-foreground">TVQ (9,975%)</span>
                    </td>
                    <td className="py-2 px-4 text-right" colSpan={isEditing ? 2 : 1}>
                      {Number(
                        isEditing
                          ? editedItems.reduce((sum, item) => sum + Number(item.amount), 0) * 0.09975
                          : invoice.tvq
                      ).toFixed(2)}{' '}
                      $
                    </td>
                  </tr>
                )}
                {/* Total */}
                <tr className="border-t-2">
                  <td className="py-3 px-4" colSpan={isEditing ? 3 : 2}>
                    <span className="text-sm font-semibold">Total</span>
                  </td>
                  <td className="py-3 px-4 text-right text-base font-semibold" colSpan={isEditing ? 2 : 1}>
                    {Number(
                      isEditing
                        ? (() => {
                            const subtotal = editedItems.reduce((sum, item) => sum + Number(item.amount), 0)
                            // Calculer avec les mêmes ratios que la facture d'origine
                            if (hasTaxes) {
                              return subtotal + subtotal * 0.05 + subtotal * 0.09975
                            }
                            return subtotal
                          })()
                        : invoice.total
                    ).toFixed(2)}{' '}
                    $
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-1">Conditions de paiement</p>
            <p>Payable à réception. Merci de votre confiance.</p>
          </div>
        </div>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

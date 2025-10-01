'use client'

import { createPortal } from 'react-dom'
import { useEffect } from 'react'

type InvoiceClient = {
  id: string
  name: string | null
  company?: string | null
  email?: string | null
  address?: string | null
}

type InvoiceForView = {
  id: string
  number: string
  status: 'draft' | 'sent' | 'paid' | string
  total: number
  createdAt: string | Date
  client: InvoiceClient | null
  items?: Array<{
    id: string
    description: string
    amount: number
    date: string | Date
    dueDate?: string | Date | null
  }>
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen || !invoice) return null

  const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(new Date(d))
  const created = new Date(invoice.createdAt)

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50 overlay-blur" onClick={onClose} />

      <div className="relative bg-background border rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <h2 className="text-base font-semibold">Facture {invoice.number}</h2>
          <button className="text-sm underline" onClick={onClose}>Fermer</button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">Facture</h3>
              <p className="text-sm text-muted-foreground">
                Statut: {invoice.status} • Créée le {formatDate(created)}
              </p>
              <p className="text-sm text-muted-foreground">Numéro: {invoice.number}</p>
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
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="py-3 px-4">{it.description}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {it.date ? formatDate(it.date) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {Number(it.amount).toFixed(2)} $
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td className="py-3 px-4 text-center text-muted-foreground" colSpan={3}>
                      Aucun élément détaillé
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-3 px-4" colSpan={2}>
                    <span className="text-sm text-muted-foreground">Total</span>
                  </td>
                  <td className="py-3 px-4 text-right text-base font-semibold">
                    {Number(invoice.total).toFixed(2)} $
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
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

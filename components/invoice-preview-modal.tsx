'use client'

import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useMemo, useState, useEffect } from 'react'

type Item = {
  id: string
  description: string
  amount: number
  date?: Date | string
}

type ClientInfo = {
  id: string
  name: string
  company?: string | null
  email: string
  address?: string | null
}

type UserInfo = {
  name: string
  company: string | null
  chargesTaxes: boolean
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  client,
  user,
  items,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  client: ClientInfo
  user: UserInfo
  items: Item[]
  onCreated?: () => void
}) {
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.amount) || 0), 0),
    [items],
  )

  const tps = useMemo(() => user.chargesTaxes ? subtotal * 0.05 : 0, [subtotal, user.chargesTaxes])
  const tvq = useMemo(() => user.chargesTaxes ? subtotal * 0.09975 : 0, [subtotal, user.chargesTaxes])
  const total = useMemo(() => subtotal + tps + tvq, [subtotal, tps, tvq])

  const hasTaxes = tps > 0 || tvq > 0
  const [isLoading, setIsLoading] = useState<'create' | 'send' | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen) return null

  const createInvoice = async (sendAfter = false) => {
    try {
      setIsLoading(sendAfter ? 'send' : 'create')
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          unpaidAmountIds: items.map((i) => i.id),
        }),
      })
      if (!res.ok) return
      const invoice = await res.json()
      if (sendAfter) {
        await fetch('/api/invoices/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: invoice.id }),
        })
      }
      onCreated?.()
      onClose()
    } finally {
      setIsLoading(null)
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-black/50 overlay-blur" onClick={onClose} />

      <div className="relative bg-background border rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <h2 className="text-base font-semibold">Prévisualisation de la facture</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={isLoading !== null}
              onClick={() => createInvoice(false)}
            >
              {isLoading === 'create' ? 'Création…' : 'Créer brouillon'}
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              disabled={isLoading !== null}
              onClick={() => createInvoice(true)}
            >
              {isLoading === 'send' ? 'Envoi…' : 'Envoyer (mock)'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header facture */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">De</p>
              {user.company && <p className="font-semibold text-base">{user.company}</p>}
              <p className="text-sm">{user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">À</p>
              <p className="font-medium">{client.name}</p>
              {client.company && <p className="text-sm">{client.company}</p>}
              {client.address && <p className="text-sm">{client.address}</p>}
              <p className="text-sm">{client.email}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold">Facture</h3>
            <p className="text-sm text-muted-foreground">Brouillon (prévisualisation)</p>
          </div>

          {/* Items */}
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
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-3 px-4">{it.description}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {it.date
                        ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(
                            new Date(it.date),
                          )
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {Number(it.amount).toFixed(2)} $
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {hasTaxes && (
                  <tr className="border-t">
                    <td className="py-3 px-4" colSpan={2}>
                      <span className="text-sm text-muted-foreground">Sous-total</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {subtotal.toFixed(2)} $
                    </td>
                  </tr>
                )}
                {hasTaxes && tps > 0 && (
                  <tr>
                    <td className="py-3 px-4" colSpan={2}>
                      <span className="text-sm text-muted-foreground">TPS (5%)</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tps.toFixed(2)} $
                    </td>
                  </tr>
                )}
                {hasTaxes && tvq > 0 && (
                  <tr>
                    <td className="py-3 px-4" colSpan={2}>
                      <span className="text-sm text-muted-foreground">TVQ (9,975%)</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tvq.toFixed(2)} $
                    </td>
                  </tr>
                )}
                <tr className="border-t">
                  <td className="py-3 px-4" colSpan={2}>
                    <span className="text-sm text-muted-foreground">Total</span>
                  </td>
                  <td className="py-3 px-4 text-right text-base font-semibold">
                    {total.toFixed(2)} $
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Conditions */}
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

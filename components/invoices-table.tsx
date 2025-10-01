'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { InvoiceViewModal } from '@/components/invoice-view-modal'

type Invoice = {
  id: string
  number: string
  status: 'draft' | 'sent' | 'paid' | string
  total: number
  createdAt: string | Date
  clientId: string
  client?: { id: string; name: string | null } | null
  items?: Array<{ id: string; description: string; amount: number; date: string | Date; dueDate?: string | Date | null }>
}

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)

  // Deterministic date formatting to avoid hydration mismatches (explicit locale + timezone)
  const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(new Date(d))

  const doAction = async (
    invoiceId: string,
    kind: 'send' | 'paid',
  ) => {
    try {
      setBusyId(invoiceId)
      const url = kind === 'send' ? '/api/invoices/send' : '/api/invoices/mark-paid'
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      if (!res.ok) {
        setToast({ type: 'error', message: "Action impossible" })
        return
      }
      router.refresh()
      setToast({ type: 'success', message: kind === 'send' ? 'Facture envoyée' : 'Facture payée' })
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau' })
    } finally {
      setBusyId(null)
      setTimeout(() => setToast(null), 2500)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-3 px-4">Numéro</th>
              <th className="text-left py-3 px-4">Client</th>
              <th className="text-left py-3 px-4">Statut</th>
              <th className="text-right py-3 px-4">Total</th>
              <th className="text-left py-3 px-4">Créée</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="py-3 px-4 font-medium">
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      ;(async () => {
                        try {
                          const res = await fetch(`/api/invoices/${inv.id}`, { cache: 'no-store' })
                          if (res.ok) {
                            const full = await res.json()
                            setSelectedInvoice(full)
                            setPreviewOpen(true)
                          }
                        } catch {
                          // ignore
                        }
                      })()
                    }}
                  >
                    {inv.number}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <Link href={`/clients/${inv.clientId}`} className="underline">
                    {inv.client?.name ?? 'Client'}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      inv.status === 'paid'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-400/10 dark:text-green-300 dark:border-green-300/20'
                        : inv.status === 'sent'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-300/20'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-300/20'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold">{Number(inv.total).toFixed(2)} $</td>
                <td className="py-3 px-4">{formatDate(inv.createdAt)}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    {inv.status === 'draft' && (
                      <button
                        className="text-xs underline disabled:opacity-60"
                        disabled={busyId === inv.id}
                        onClick={() => doAction(inv.id, 'send')}
                      >
                        {busyId === inv.id ? 'Envoi…' : 'Envoyer (mock)'}
                      </button>
                    )}
                    {inv.status !== 'paid' && (
                      <button
                        className="text-xs underline disabled:opacity-60"
                        disabled={busyId === inv.id}
                        onClick={() => doAction(inv.id, 'paid')}
                      >
                        {busyId === inv.id && invoices.find((i) => i.id === inv.id)?.status !== 'draft'
                          ? 'Maj…'
                          : 'Marquer payée'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <InvoiceViewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={selectedInvoice}
      />
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-md border px-3 py-2 text-sm shadow-md ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-400/10 dark:text-green-300 dark:border-green-300/20'
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-400/10 dark:text-red-300 dark:border-red-300/20'
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}

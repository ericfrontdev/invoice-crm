'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, Mail, CheckCircle, Trash2 } from 'lucide-react'
import { InvoiceViewModal } from '@/components/invoice-view-modal-edit'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'

type Invoice = {
  id: string
  number: string
  status: 'draft' | 'sent' | 'paid' | string
  total: number
  createdAt: string | Date
  clientId: string
  client: { id: string; name: string | null } | null
  items?: Array<{ id: string; description: string; amount: number; date: string | Date; dueDate?: string | Date | null }>
}

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Deterministic date formatting to avoid hydration mismatches (explicit locale + timezone)
  const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(new Date(d))

  const doAction = async (
    invoiceId: string,
    kind: 'send' | 'paid' | 'delete',
  ) => {
    try {
      setBusyId(invoiceId)
      let url = ''
      let method = 'POST'
      let successMsg = ''

      if (kind === 'send') {
        url = '/api/invoices/send'
        successMsg = 'Facture envoyée'
      } else if (kind === 'paid') {
        url = '/api/invoices/mark-paid'
        successMsg = 'Facture payée'
      } else if (kind === 'delete') {
        url = `/api/invoices/${invoiceId}`
        method = 'DELETE'
        successMsg = 'Facture supprimée'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ invoiceId }) : undefined,
      })
      if (!res.ok) {
        setToast({ type: 'error', message: "Action impossible" })
        return
      }
      router.refresh()
      setToast({ type: 'success', message: successMsg })
      setDeleteConfirmId(null)
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
                  {inv.number}
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
                  <div className="flex justify-end gap-1">
                    {/* Voir */}
                    <Tooltip content="Voir et modifier">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
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
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Tooltip>

                    {/* Envoyer */}
                    {inv.status === 'draft' && (
                      <Tooltip content="Envoyer par email">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={busyId === inv.id}
                          onClick={() => doAction(inv.id, 'send')}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    )}

                    {/* Marquer payée */}
                    {inv.status !== 'paid' && (
                      <Tooltip content="Marquer comme payée">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 dark:text-green-400"
                          disabled={busyId === inv.id}
                          onClick={() => doAction(inv.id, 'paid')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    )}

                    {/* Supprimer */}
                    <Tooltip content="Supprimer">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => setDeleteConfirmId(inv.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Tooltip>
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
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            doAction(deleteConfirmId, 'delete')
          }
        }}
        title="Supprimer la facture"
        description="Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible."
        confirmText="Supprimer"
        isLoading={busyId === deleteConfirmId}
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

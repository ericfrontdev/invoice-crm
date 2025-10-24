'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InvoiceCard } from '@/components/invoice-card'
import { InvoiceViewModal } from '@/components/invoice-view-modal-edit'
import { ConfirmDialog } from '@/components/confirm-dialog'

type Invoice = {
  id: string
  number: string
  status: string
  subtotal: number
  tps: number
  tvq: number
  total: number
  createdAt: Date
  items?: Array<{
    id: string
    description: string
    amount: number
    date: Date
    dueDate?: Date | null
  }>
}

type ProjectInvoicesListProps = {
  invoices: Invoice[]
  clientId: string
  clientName: string
  projectId: string
}

export function ProjectInvoicesList({
  invoices,
  clientId,
  clientName,
  projectId,
}: ProjectInvoicesListProps) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const doAction = async (
    invoiceId: string,
    kind: 'send' | 'paid' | 'delete'
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
        setToast({ type: 'error', message: 'Action impossible' })
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

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { cache: 'no-store' })
      if (res.ok) {
        const full = await res.json()
        setSelectedInvoice(full)
        setPreviewOpen(true)
      }
    } catch {
      // ignore
    }
  }

  const handleCopyPaymentLink = (invoiceId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const paymentUrl = `${baseUrl}/invoices/${invoiceId}/pay`

    navigator.clipboard
      .writeText(paymentUrl)
      .then(() => {
        setToast({ type: 'success', message: 'Lien de paiement copié!' })
        setTimeout(() => setToast(null), 2500)
      })
      .catch(() => {
        setToast({ type: 'error', message: 'Erreur lors de la copie' })
        setTimeout(() => setToast(null), 2500)
      })
  }

  if (invoices.length === 0) {
    return null
  }

  // Convertir les factures pour InvoiceCard
  const invoicesWithClient = invoices.map((inv) => ({
    ...inv,
    clientId,
    client: {
      id: clientId,
      name: clientName,
      email: undefined,
    },
    project: {
      id: projectId,
      name: '',
    },
    items: inv.items || [],
  }))

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Factures du projet</h2>
        <div className="grid grid-cols-1 gap-3">
          {invoicesWithClient.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              isSelectionMode={false}
              isSelected={false}
              onToggleSelect={() => {}}
              onView={() => handleViewInvoice(inv.id)}
              onSend={() => doAction(inv.id, 'send')}
              onMarkPaid={() => doAction(inv.id, 'paid')}
              onDelete={() => setDeleteConfirmId(inv.id)}
              onCopyLink={() => handleCopyPaymentLink(inv.id)}
              onResend={() => doAction(inv.id, 'send')}
              isBusy={busyId === inv.id}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
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

'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, Mail, CheckCircle, Trash2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { InvoiceViewModal } from '@/components/invoice-view-modal-edit'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Checkbox } from '@/components/ui/checkbox'

type Invoice = {
  id: string
  number: string
  status: string
  subtotal: number
  tps: number
  tvq: number
  total: number
  createdAt: Date
  project: {
    id: string
    name: string
  } | null
}

type InvoiceForView = Invoice & {
  client: {
    id: string
    name: string | null
    company?: string | null
    email?: string | null
    address?: string | null
  } | null
}

type ClientWithInvoices = {
  id: string
  name: string
  invoices: Invoice[]
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-400/10 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-300',
}

const statusLabels = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
}

export function InvoicesTab({
  client,
  showArchived,
  setShowArchived,
}: {
  client: ClientWithInvoices
  showArchived?: boolean
  setShowArchived?: (show: boolean) => void
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceForView | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([])
  const [batchAction, setBatchAction] = useState<'delete' | 'archive' | null>(
    null
  )
  const [internalShowArchived, setInternalShowArchived] = useState(false)
  const archiveSectionRef = useRef<HTMLDivElement>(null)

  // Use external state if provided, otherwise use internal state
  const isArchived = showArchived ?? internalShowArchived
  const toggleArchived = setShowArchived ?? setInternalShowArchived

  // Scroll to archives section when it opens
  useEffect(() => {
    if (isArchived && archiveSectionRef.current) {
      // Wait for animation to complete (500ms animation duration)
      setTimeout(() => {
        archiveSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }, 600)
    }
  }, [isArchived])

  // Séparer les factures de projets, ponctuelles et archivées
  const projectInvoices = client.invoices.filter(
    (inv) => inv.project !== null && inv.status !== 'archived'
  )
  const punctualInvoices = client.invoices.filter(
    (inv) => inv.project === null && inv.status !== 'archived'
  )
  const archivedInvoices = client.invoices.filter(
    (inv) => inv.status === 'archived'
  )

  const totalInvoiced = client.invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = client.invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  const totalPending = totalInvoiced - totalPaid

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const toggleSelectAll = (invoices: Invoice[]) => {
    const invoiceIds = invoices.map((inv) => inv.id)
    const allSelected = invoiceIds.every((id) =>
      selectedInvoiceIds.includes(id)
    )

    if (allSelected) {
      setSelectedInvoiceIds((prev) =>
        prev.filter((id) => !invoiceIds.includes(id))
      )
    } else {
      setSelectedInvoiceIds((prev) => [...new Set([...prev, ...invoiceIds])])
    }
  }

  const doBatchAction = async (action: 'delete' | 'archive') => {
    if (selectedInvoiceIds.length === 0) return

    try {
      setBusyId('batch')

      if (action === 'delete') {
        await Promise.all(
          selectedInvoiceIds.map((id) =>
            fetch(`/api/invoices/${id}`, { method: 'DELETE' })
          )
        )
        setToast({
          type: 'success',
          message: `${selectedInvoiceIds.length} facture(s) supprimée(s)`,
        })
      } else if (action === 'archive') {
        await Promise.all(
          selectedInvoiceIds.map((id) =>
            fetch(`/api/invoices/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'archived' }),
            })
          )
        )
        setToast({
          type: 'success',
          message: `${selectedInvoiceIds.length} facture(s) archivée(s)`,
        })
      }

      setSelectedInvoiceIds([])
      setBatchAction(null)
      router.refresh()
    } catch {
      setToast({ type: 'error', message: "Erreur lors de l'action" })
    } finally {
      setBusyId(null)
      setTimeout(() => setToast(null), 2500)
    }
  }

  const doAction = async (
    invoiceId: string,
    kind: 'send' | 'paid' | 'delete' | 'unarchive'
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
      } else if (kind === 'unarchive') {
        url = `/api/invoices/${invoiceId}`
        method = 'PATCH'
        successMsg = 'Facture désarchivée'
      } else if (kind === 'delete') {
        url = `/api/invoices/${invoiceId}`
        method = 'DELETE'
        successMsg = 'Facture supprimée'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:
          method === 'POST'
            ? JSON.stringify({ invoiceId })
            : method === 'PATCH'
              ? JSON.stringify({ status: 'draft' })
              : undefined,
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

  const renderInvoiceTable = (
    invoices: Invoice[],
    emptyMessage: string,
    isArchived = false
  ) => {
    if (invoices.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )
    }

    const invoiceIds = invoices.map((inv) => inv.id)
    const allSelected = invoiceIds.every((id) =>
      selectedInvoiceIds.includes(id)
    )
    const selectedFromThisTable = invoiceIds.filter((id) =>
      selectedInvoiceIds.includes(id)
    )

    return (
      <div className="space-y-3">
        {/* Batch Actions Bar for this table */}
        {selectedFromThisTable.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {selectedFromThisTable.length} facture(s) sélectionnée(s)
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedInvoiceIds((prev) =>
                    prev.filter((id) => !invoiceIds.includes(id))
                  )
                }}
              >
                Désélectionner
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBatchAction('archive')}
                disabled={busyId === 'batch'}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archiver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBatchAction('delete')}
                disabled={busyId === 'batch'}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => toggleSelectAll(invoices)}
                    aria-label="Tout sélectionner"
                  />
                </th>
                <th className="text-left p-3 font-medium">Numéro</th>
                {invoices === projectInvoices && (
                  <th className="text-left p-3 font-medium">Projet</th>
                )}
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Montant</th>
                <th className="text-left p-3 font-medium">Statut</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-t hover:bg-muted/50"
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedInvoiceIds.includes(invoice.id)}
                      onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                      aria-label={`Sélectionner ${invoice.number}`}
                    />
                  </td>
                  <td className="p-3 font-medium">{invoice.number}</td>
                  {invoices === projectInvoices && (
                    <td className="p-3">
                      <span className="text-sm">{invoice.project?.name}</span>
                    </td>
                  )}
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-medium">
                    {invoice.total.toFixed(2)} $
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[
                          invoice.status as keyof typeof statusColors
                        ] || statusColors.draft
                      }`}
                    >
                      {statusLabels[
                        invoice.status as keyof typeof statusLabels
                      ] || invoice.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      {/* Voir */}
                      <Tooltip content="Voir et modifier">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            ;(async () => {
                              try {
                                const res = await fetch(
                                  `/api/invoices/${invoice.id}`,
                                  {
                                    cache: 'no-store',
                                  }
                                )
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

                      {/* Désarchiver (seulement pour les factures archivées) */}
                      {isArchived && (
                        <Tooltip content="Désarchiver">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            disabled={busyId === invoice.id}
                            onClick={() => doAction(invoice.id, 'unarchive')}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}

                      {/* Envoyer */}
                      {!isArchived && invoice.status === 'draft' && (
                        <Tooltip content="Envoyer par email">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={busyId === invoice.id}
                            onClick={() => doAction(invoice.id, 'send')}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}

                      {/* Marquer payée */}
                      {!isArchived && invoice.status !== 'paid' && (
                        <Tooltip content="Marquer comme payée">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 dark:text-green-400"
                            disabled={busyId === invoice.id}
                            onClick={() => doAction(invoice.id, 'paid')}
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
                          onClick={() => setDeleteConfirmId(invoice.id)}
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
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-1">Total facturé</p>
            <p className="text-2xl font-bold">{totalInvoiced.toFixed(2)} $</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-1">Total payé</p>
            <p className="text-2xl font-bold text-green-600">
              {totalPaid.toFixed(2)} $
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-1">En attente</p>
            <p className="text-2xl font-bold text-amber-600">
              {totalPending.toFixed(2)} $
            </p>
          </div>
        </div>

        {/* Factures de projets */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Factures de projets</h3>
          <div className="bg-card rounded-lg border overflow-hidden">
            {renderInvoiceTable(
              projectInvoices,
              'Aucune facture de projet pour ce client'
            )}
          </div>
        </div>

        {/* Factures ponctuelles */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Factures ponctuelles</h3>
          <div className="bg-card rounded-lg border overflow-hidden">
            {renderInvoiceTable(
              punctualInvoices,
              'Aucune facture ponctuelle pour ce client'
            )}
          </div>
        </div>

        {/* Bouton archives */}
        {archivedInvoices.length > 0 && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={() => toggleArchived(!isArchived)}
              className="cursor-pointer"
            >
              <Archive className="h-4 w-4 mr-2" />
              {isArchived
                ? 'Masquer les archives'
                : `Voir les factures archivées (${archivedInvoices.length})`}
            </Button>
          </div>
        )}
      </div>

      {/* Section archives avec animation */}
      <motion.div
        ref={archiveSectionRef}
        initial={{ height: 0 }}
        animate={{ height: isArchived ? 'auto' : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="space-y-3 pt-6">
          <h3 className="text-lg font-semibold">Factures archivées</h3>
          <div className="bg-card rounded-lg border overflow-hidden">
            {renderInvoiceTable(
              archivedInvoices,
              'Aucune facture archivée',
              true
            )}
          </div>
        </div>
      </motion.div>

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
      <ConfirmDialog
        isOpen={batchAction !== null}
        onClose={() => setBatchAction(null)}
        onConfirm={() => {
          if (batchAction) {
            doBatchAction(batchAction)
          }
        }}
        title={
          batchAction === 'delete'
            ? `Supprimer ${selectedInvoiceIds.length} facture(s)`
            : `Archiver ${selectedInvoiceIds.length} facture(s)`
        }
        description={
          batchAction === 'delete'
            ? `Êtes-vous sûr de vouloir supprimer ${selectedInvoiceIds.length} facture(s) ? Cette action est irréversible.`
            : `Êtes-vous sûr de vouloir archiver ${selectedInvoiceIds.length} facture(s) ?`
        }
        confirmText={batchAction === 'delete' ? 'Supprimer' : 'Archiver'}
        isLoading={busyId === 'batch'}
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

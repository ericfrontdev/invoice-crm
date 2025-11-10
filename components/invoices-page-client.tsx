'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { InvoicesTable } from '@/components/invoices-table'
import { InvoiceViewModal } from '@/components/invoice-view-modal-edit'
import { CreateInvoiceButton } from '@/components/create-invoice-button'
import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type Invoice = {
  id: string
  number: string
  status: 'draft' | 'sent' | 'paid' | string
  subtotal: number
  tps: number
  tvq: number
  total: number
  createdAt: string | Date
  dueDate?: string | Date | null
  clientId: string
  client: { id: string; name: string | null; email?: string } | null
  project?: { id: string; name: string } | null
  items?: Array<{ id: string; description: string; amount: number; date: string | Date; dueDate?: string | Date | null }>
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

export function InvoicesPageClient({
  projectInvoices,
  standaloneInvoices,
}: {
  projectInvoices: Invoice[]
  standaloneInvoices: Invoice[]
}) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const viewId = searchParams.get('view')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceForView | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (viewId) {
      // Fetch and open the invoice
      fetch(`/api/invoices/${viewId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setSelectedInvoice(data)
            setPreviewOpen(true)
          }
        })
        .catch(() => {
          // ignore
        })
    }
  }, [viewId])

  const totalInvoices = projectInvoices.length + standaloneInvoices.length

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('invoices.title')}</h1>
          <p className="text-muted-foreground">
            {t('invoices.manageAllInvoices')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href="/factures/rappels">
              <History className="h-4 w-4 mr-2" />
              {t('reminders.timeline')}
            </Link>
          </Button>
          <CreateInvoiceButton />
        </div>
      </div>

      {totalInvoices === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          {t('invoices.noInvoices')}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Factures de projets */}
          {projectInvoices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{t('invoices.projectInvoices')}</h2>
                <span className="text-sm text-muted-foreground">
                  ({projectInvoices.length})
                </span>
              </div>
              <InvoicesTable invoices={projectInvoices} showProject />
            </div>
          )}

          {/* Factures ponctuelles */}
          {standaloneInvoices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{t('invoices.standaloneInvoices')}</h2>
                <span className="text-sm text-muted-foreground">
                  ({standaloneInvoices.length})
                </span>
              </div>
              <InvoicesTable invoices={standaloneInvoices} />
            </div>
          )}
        </div>
      )}

      <InvoiceViewModal
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false)
          setSelectedInvoice(null)
          // Remove view param from URL
          window.history.replaceState({}, '', '/invoices')
        }}
        invoice={selectedInvoice}
      />
    </>
  )
}

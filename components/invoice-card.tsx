'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Eye,
  Mail,
  CheckCircle,
  Trash2,
  MoreVertical,
  Calendar,
  Link2,
  RefreshCw,
  Bell,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  items?: Array<{
    id: string
    description: string
    amount: number
    date: string | Date
    dueDate?: string | Date | null
  }>
  _count?: {
    reminders?: number
  }
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-400/10 dark:text-gray-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-300',
  archived:
    'bg-slate-100 text-slate-800 dark:bg-slate-400/10 dark:text-slate-300',
}

// Status labels will be translated dynamically

const statusIcons = {
  draft: '📝',
  sent: '📧',
  paid: '✓',
  archived: '📦',
}

export function InvoiceCard({
  invoice,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  onView,
  onSend,
  onMarkPaid,
  onDelete,
  onCopyLink,
  onResend,
  isBusy,
}: {
  invoice: Invoice
  isSelectionMode: boolean
  isSelected: boolean
  onToggleSelect: () => void
  onView: () => void
  onSend: () => void
  onMarkPaid: () => void
  onDelete: () => void
  onCopyLink: () => void
  onResend: () => void
  isBusy: boolean
}) {
  const { t } = useTranslation()
  const [longPressTriggered, setLongPressTriggered] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const formatDate = (d: string | Date) =>
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(new Date(d))

  // Vérifier si la facture est en retard
  const isOverdue = invoice.status === 'sent' &&
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date()

  const handleTouchStart = () => {
    if (isSelectionMode) return

    longPressTimer.current = setTimeout(() => {
      setLongPressTriggered(true)
      // Vibrate for haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      onToggleSelect()
    }, 1500) // 500ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Reset after a short delay
    setTimeout(() => {
      setLongPressTriggered(false)
    }, 100)
  }

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect()
    } else if (!longPressTriggered) {
      onView()
    }
  }

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  return (
    <div
      className={`relative bg-card rounded-lg border p-4 transition-all select-none ${
        isSelectionMode ? 'cursor-pointer' : 'cursor-default'
      } ${
        isSelected
          ? 'ring-2 ring-primary border-primary bg-primary/5'
          : 'hover:shadow-md'
      }`}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault()
        onToggleSelect()
      }}
    >
      {/* Checkbox en mode sélection */}
      {isSelectionMode && (
        <div className="absolute top-4 left-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Menu 3 points - visible seulement hors mode sélection */}
      {!isSelectionMode && (
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 mt-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onView()
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('invoices.viewInvoice')}
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Link href={`/factures/${invoice.id}/rappels`}>
                  <History className="h-4 w-4 mr-2" />
                  {t('crm.viewDetails')}
                </Link>
              </DropdownMenuItem>
              {invoice.status === 'draft' && invoice.client?.email && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onSend()
                  }}
                  disabled={isBusy}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {t('invoices.sendInvoice')}
                </DropdownMenuItem>
              )}
              {invoice.status === 'sent' && invoice.client?.email && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onResend()
                  }}
                  disabled={isBusy}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('invoices.sendInvoice')}
                </DropdownMenuItem>
              )}
              {invoice.status !== 'draft' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopyLink()
                  }}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  {t('invoices.copyLink')}
                </DropdownMenuItem>
              )}
              {invoice.status !== 'paid' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onMarkPaid()
                  }}
                  disabled={isBusy}
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  {t('invoices.markAsPaid')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Contenu de la carte */}
      <div className={`${isSelectionMode ? 'pl-10' : ''}`}>
        {/* En-tête: Numéro + Badge statut */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base">{invoice.number}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                statusColors[invoice.status as keyof typeof statusColors] ||
                statusColors.draft
              }`}
            >
              <span>
                {statusIcons[invoice.status as keyof typeof statusIcons] || '📝'}
              </span>
              {invoice.status === 'draft' && t('invoices.draft')}
              {invoice.status === 'sent' && t('invoices.sent')}
              {invoice.status === 'paid' && t('invoices.paid')}
              {invoice.status === 'archived' && t('common.archive')}
              {!['draft', 'sent', 'paid', 'archived'].includes(invoice.status) && invoice.status}
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300">
                ⚠️ {t('invoices.overdue')}
              </span>
            )}
          </div>
        </div>

        {/* Client */}
        <div className="mb-3">
          {isSelectionMode ? (
            <span className="text-sm font-medium text-primary">
              {invoice.client?.name ?? t('invoices.client')}
            </span>
          ) : (
            <Link
              href={`/clients/${invoice.clientId}`}
              className="text-sm font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {invoice.client?.name ?? t('invoices.client')}
            </Link>
          )}
          {invoice.project && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('projects.title')}: {invoice.project.name}
            </div>
          )}
          {(invoice._count?.reminders ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Bell className="h-3 w-3" />
              <span>{invoice._count?.reminders ?? 0} {t('reminders.title').toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Montant + Date */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {formatDate(invoice.createdAt)}
          </div>
          <div className="text-lg font-bold">
            {Number(invoice.total).toFixed(2)} $
          </div>
        </div>
      </div>
    </div>
  )
}

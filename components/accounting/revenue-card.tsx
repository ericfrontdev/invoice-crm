'use client'

import Link from 'next/link'
import { FileText, DollarSign, Calendar, MoreVertical, Trash2, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type CombinedRevenue = {
  id: string
  type: 'invoice' | 'manual'
  description: string
  amount: number
  date: Date
  clientId?: string
  clientName?: string
  projectName?: string | null
  category?: string | null
}

export function RevenueCard({
  revenue,
  onDelete,
}: {
  revenue: CombinedRevenue
  onDelete: (id: string, description: string) => void
}) {
  const { t } = useTranslation()
  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(d))

  return (
    <div className="relative bg-card rounded-lg border p-4 select-none">
      {/* Menu 3 points - visible seulement pour les revenus manuels */}
      {revenue.type === 'manual' && (
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(revenue.id, revenue.description)
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
      <div className={`${revenue.type === 'manual' ? 'pr-8' : ''}`}>
        {/* En-tête: Type + Montant */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {revenue.type === 'invoice' ? (
              <>
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">{t('accounting.invoice')}</span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">{t('accounting.manual')}</span>
              </>
            )}
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            +{revenue.amount.toFixed(2)} $
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <h3 className="font-semibold text-base">{revenue.description}</h3>
        </div>

        {/* Client / Catégorie */}
        <div className="mb-3">
          {revenue.type === 'invoice' && revenue.clientName ? (
            <Link
              href={`/clients/${revenue.clientId}`}
              className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {revenue.clientName}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          ) : revenue.category ? (
            <span className="text-sm text-muted-foreground">{revenue.category}</span>
          ) : (
            <span className="text-sm text-muted-foreground italic">{t('accounting.uncategorized')}</span>
          )}
          {revenue.projectName && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('accounting.project')}: {revenue.projectName}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-muted-foreground pt-3 border-t">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {formatDate(revenue.date)}
        </div>
      </div>
    </div>
  )
}

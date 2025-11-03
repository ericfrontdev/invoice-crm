'use client'

import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Expense = {
  id: string
  description: string
  amount: number
  date: Date
  category: string | null
}

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
}: {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}) {
  const { t } = useTranslation()
  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat('fr-FR').format(new Date(d))

  return (
    <div className="relative bg-card rounded-lg border p-4 select-none">
      {/* Menu 3 points */}
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
                onEdit(expense)
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onDelete(expense.id)
              }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contenu de la carte */}
      <div className="pr-8">
        {/* En-tête: Description + Montant */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-base flex-1">{expense.description}</h3>
          <div className="text-lg font-bold text-red-600 dark:text-red-400 ml-2">
            -{expense.amount.toFixed(2)} $
          </div>
        </div>

        {/* Catégorie */}
        <div className="mb-3">
          {expense.category ? (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-300/20">
              {expense.category}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center text-xs text-muted-foreground pt-3 border-t">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {formatDate(expense.date)}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpRight, Search, Plus, FileText, DollarSign, Trash2 } from 'lucide-react'
import { AddRevenueModal } from '@/components/add-revenue-modal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RevenueCard } from '@/components/accounting/revenue-card'

type Invoice = {
  id: string
  number: string
  total: number
  createdAt: Date
  client: {
    id: string
    name: string
  }
  project: {
    id: string
    name: string
  } | null
}

type ManualRevenue = {
  id: string
  description: string
  amount: number
  date: Date
  category: string | null
}

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

export function RevenueTab({
  invoices,
  manualRevenues,
}: {
  invoices: Invoice[]
  manualRevenues: ManualRevenue[]
}) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [revenueToDelete, setRevenueToDelete] = useState<{ id: string; description: string } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Combiner factures et revenus manuels
  const allRevenues: CombinedRevenue[] = [
    ...invoices.map((inv) => ({
      id: inv.id,
      type: 'invoice' as const,
      description: inv.number,
      amount: inv.total,
      date: inv.createdAt,
      clientId: inv.client.id,
      clientName: inv.client.name,
      projectName: inv.project?.name || null,
    })),
    ...manualRevenues.map((rev) => ({
      id: rev.id,
      type: 'manual' as const,
      description: rev.description,
      amount: rev.amount,
      date: rev.date,
      category: rev.category,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filtrer par date
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const dateFilteredRevenues = allRevenues.filter((revenue) => {
    const revenueDate = new Date(revenue.date)
    if (dateFilter === 'month') return revenueDate >= startOfMonth
    if (dateFilter === 'year') return revenueDate >= startOfYear
    return true
  })

  // Filtrer par recherche
  const filteredRevenues = dateFilteredRevenues.filter((revenue) => {
    const search = searchTerm.toLowerCase()
    return (
      revenue.description.toLowerCase().includes(search) ||
      revenue.clientName?.toLowerCase().includes(search) ||
      revenue.projectName?.toLowerCase().includes(search) ||
      revenue.category?.toLowerCase().includes(search)
    )
  })

  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0)

  const handleAddRevenue = async (data: {
    description: string
    amount: number
    date: string
    category?: string
  }) => {
    await fetch('/api/revenues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    router.refresh()
  }

  const handleDeleteRevenue = async () => {
    if (!revenueToDelete) return

    await fetch(`/api/revenues/${revenueToDelete.id}`, {
      method: 'DELETE',
    })

    setDeleteModalOpen(false)
    setRevenueToDelete(null)
    router.refresh()
  }

  const openDeleteModal = (id: string, description: string) => {
    setRevenueToDelete({ id, description })
    setDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">{t('accounting.allRevenues')}</h3>
          <p className="text-sm text-muted-foreground">
            {filteredRevenues.length} {filteredRevenues.length > 1 ? t('accounting.transactions') : t('accounting.transaction')} • {t('common.total')}{': '}
            {totalRevenue.toFixed(2)} $
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('accounting.addRevenue')}
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search') + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t('accounting.period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('accounting.allPeriods')}</SelectItem>
              <SelectItem value="month">{t('accounting.thisMonth')}</SelectItem>
              <SelectItem value="year">{t('accounting.thisYear')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table des revenus / Cartes mobile */}
      <div className="bg-card rounded-lg border">
        {filteredRevenues.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {searchTerm || dateFilter !== 'all' ? t('accounting.noRevenueFound') : t('accounting.noRevenues')}
          </div>
        ) : isMobile ? (
          /* Mobile: Card view */
          <div className="p-4 space-y-3">
            {filteredRevenues.map((revenue) => (
              <RevenueCard
                key={`${revenue.type}-${revenue.id}`}
                revenue={revenue}
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        ) : (
          /* Desktop: Table view */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">{t('common.date')}</th>
                  <th className="text-left py-3 px-4">{t('common.description')}</th>
                  <th className="text-left py-3 px-4">{t('common.type')}</th>
                  <th className="text-left py-3 px-4">{t('accounting.client')} / {t('common.category')}</th>
                  <th className="text-right py-3 px-4">{t('common.amount')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRevenues.map((revenue) => (
                  <tr key={`${revenue.type}-${revenue.id}`} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4">
                      {new Date(revenue.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                    </td>
                    <td className="py-3 px-4 font-medium">{revenue.description}</td>
                    <td className="py-3 px-4">
                      {revenue.type === 'invoice' ? (
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-300/20">
                          <FileText className="h-3 w-3 mr-1" />
                          {t('accounting.invoice')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border-green-200 dark:bg-green-400/10 dark:text-green-300 dark:border-green-300/20">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {t('accounting.manual')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {revenue.type === 'invoice' && revenue.clientName ? (
                        <Link
                          href={`/clients/${revenue.clientId}`}
                          className="hover:underline flex items-center gap-1 text-sm"
                        >
                          {revenue.clientName}
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      ) : revenue.category ? (
                        <span className="text-sm text-muted-foreground">{revenue.category}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                      +{revenue.amount.toFixed(2)} $
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddRevenueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddRevenue}
      />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('accounting.deleteRevenue')}</DialogTitle>
            <DialogDescription>
              {t('accounting.areYouSureDeleteRevenue')} &quot;{revenueToDelete?.description}&quot; ? {t('accounting.thisActionIsIrreversible')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false)
                setRevenueToDelete(null)
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRevenue}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

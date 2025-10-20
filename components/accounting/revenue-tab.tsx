'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowUpRight, Search, Plus, FileText, DollarSign, Trash2, MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AddRevenueModal } from '@/components/add-revenue-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [revenueToDelete, setRevenueToDelete] = useState<{ id: string; description: string } | null>(null)

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
          <h3 className="font-semibold text-lg">Tous les revenus</h3>
          <p className="text-sm text-muted-foreground">
            {filteredRevenues.length} transaction{filteredRevenues.length > 1 ? 's' : ''} • Total{': '}
            {totalRevenue.toFixed(2)} $
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un revenu
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les périodes</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table des revenus */}
      <div className="bg-card rounded-lg border">
        {filteredRevenues.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {searchTerm || dateFilter !== 'all' ? 'Aucun revenu trouvé' : 'Aucun revenu'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Client / Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRevenues.map((revenue) => (
                <TableRow key={`${revenue.type}-${revenue.id}`}>
                  <TableCell>
                    {revenue.type === 'invoice' ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm">Facture</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm">Manuel</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{revenue.description}</TableCell>
                  <TableCell>
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
                      <span className="text-sm text-muted-foreground italic">Non catégorisé</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(revenue.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                    +{revenue.amount.toFixed(2)} $
                  </TableCell>
                  <TableCell>
                    {revenue.type === 'manual' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(revenue.id, revenue.description)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            <DialogTitle>Supprimer le revenu</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le revenu &quot;{revenueToDelete?.description}&quot; ? Cette action est irréversible.
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
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRevenue}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

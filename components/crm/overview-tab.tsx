'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FolderKanban,
  FileText,
  DollarSign,
  Clock,
  StickyNote,
  Plus,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

type Client = {
  id: string
  name: string
  company: string | null
  email: string
  projects: Array<{
    id: string
    name: string
    status: string
    budget: number | null
    invoices: Array<{ total: number }>
  }>
  invoices: Array<{
    id: string
    number: string
    status: string
    total: number
    createdAt: Date
    project: {
      id: string
      name: string
    } | null
  }>
  unpaidAmounts: Array<{
    amount: number
    dueDate: Date | null
  }>
  notes: Array<{
    id: string
  }>
}

export function OverviewTab({
  client,
  onCreateProject,
  onCreateInvoice,
  onCreateInvoiceForProject,
  onAddNote,
}: {
  client: Client
  onCreateProject: () => void
  onCreateInvoice: () => void
  onCreateInvoiceForProject: (projectId: string) => void
  onAddNote: () => void
}) {
  const { t } = useTranslation()

  // Calculs des métriques
  const activeProjects = client.projects.filter((p) => p.status === 'active').length
  const completedProjects = client.projects.filter((p) => p.status === 'completed').length
  const totalProjects = client.projects.length

  const draftInvoices = client.invoices.filter((i) => i.status === 'draft').length
  const sentInvoices = client.invoices.filter((i) => i.status === 'sent').length
  const paidInvoices = client.invoices.filter((i) => i.status === 'paid').length
  const totalInvoices = client.invoices.length

  const totalInvoiced = client.invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = client.invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  const totalUnpaid = client.unpaidAmounts.reduce((sum, amt) => sum + amt.amount, 0)

  const overdueAmounts = client.unpaidAmounts.filter(
    (amt) => amt.dueDate && new Date(amt.dueDate) < new Date()
  )

  // Statuts des projets
  const projectsByStatus = {
    active: activeProjects,
    completed: completedProjects,
    paused: client.projects.filter((p) => p.status === 'paused').length,
    cancelled: client.projects.filter((p) => p.status === 'cancelled').length,
  }

  // Dernières activités (factures récentes)
  const recentInvoices = [...client.invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projets */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-muted-foreground">{t('crm.projects')}</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{totalProjects}</p>
            <p className="text-xs text-muted-foreground">
              {activeProjects} {t('crm.overview.active')} • {completedProjects} {t('crm.overview.completed')}
            </p>
          </div>
        </div>

        {/* Factures */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-muted-foreground">Factures</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{totalInvoices}</p>
            <p className="text-xs text-muted-foreground">
              {paidInvoices} payées • {sentInvoices} envoyées • {draftInvoices} brouillon
            </p>
          </div>
        </div>

        {/* Montant total */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-muted-foreground">Facturé</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{totalInvoiced.toFixed(2)} $</p>
            <p className="text-xs text-muted-foreground">
              {totalPaid.toFixed(2)} $ payé
            </p>
          </div>
        </div>

        {/* Sommes dues */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-muted-foreground">Sommes dues</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{totalUnpaid.toFixed(2)} $</p>
            <p className="text-xs text-muted-foreground">
              {overdueAmounts.length} en retard
            </p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-3 cursor-pointer"
            onClick={onCreateProject}
          >
            <FolderKanban className="h-4 w-4 mr-2" />
            Nouveau projet
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 cursor-pointer w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Créer une facture
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              <DropdownMenuLabel>Choisir le type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCreateInvoice}>
                <FileText className="h-4 w-4 mr-2" />
                Facture ponctuelle
              </DropdownMenuItem>
              {client.projects.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Pour un projet</DropdownMenuLabel>
                  {client.projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => onCreateInvoiceForProject(project.id)}
                    >
                      <FolderKanban className="h-4 w-4 mr-2" />
                      {project.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className="justify-start h-auto py-3 cursor-pointer"
            onClick={onAddNote}
          >
            <StickyNote className="h-4 w-4 mr-2" />
            Ajouter une note
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statut des projets */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statut des projets
          </h3>
          {totalProjects === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun projet pour ce client
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Actifs</span>
                </div>
                <span className="font-medium">{projectsByStatus.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Terminés</span>
                </div>
                <span className="font-medium">{projectsByStatus.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">En pause</span>
                </div>
                <span className="font-medium">{projectsByStatus.paused}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Annulés</span>
                </div>
                <span className="font-medium">{projectsByStatus.cancelled}</span>
              </div>
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dernières factures
          </h3>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune facture
            </p>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {invoice.status === 'paid' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : invoice.status === 'sent' ? (
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{invoice.number}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-center">
                    <div className="text-xs text-muted-foreground truncate">
                      {invoice.project ? invoice.project.name : 'Facture ponctuelle'}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-medium">{invoice.total.toFixed(2)} $</div>
                    <div className="text-xs text-muted-foreground">
                      {invoice.status === 'paid' ? 'Payée' : invoice.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes count */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium">Notes</span>
          </div>
          <span className="text-2xl font-bold">{client.notes.length}</span>
        </div>
      </div>
    </div>
  )
}

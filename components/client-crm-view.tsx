'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from '@/components/crm/overview-tab'
import { ProjectsTab } from '@/components/crm/projects-tab'
import { InvoicesTab } from '@/components/crm/invoices-tab'
import { NotesTab } from '@/components/crm/notes-tab'
import { CreateInvoiceForProjectModal } from '@/components/crm/create-invoice-for-project-modal'
import { useTranslation } from '@/lib/i18n-context'

type ClientWithCRM = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
  projects: Array<{
    id: string
    name: string
    description: string | null
    status: string
    budget: number | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date
    invoices: Array<{
      id: string
      number: string
      subtotal: number
      tps: number
      tvq: number
      total: number
      status: string
    }>
    files: Array<{
      id: string
      filename: string
      fileSize: number
      mimeType: string
      uploadedAt: Date
    }>
  }>
  invoices: Array<{
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
  }>
  unpaidAmounts: Array<{
    amount: number
    dueDate: Date | null
  }>
  notes: Array<{
    id: string
    title: string
    content: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
  }>
}

export function ClientCRMView({ client, openProjectModal = false, initialTab }: { client: ClientWithCRM; openProjectModal?: boolean; initialTab?: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(initialTab || 'overview')

  // Modal states shared across tabs
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedProjectForInvoice, setSelectedProjectForInvoice] = useState<string | null>(null)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)

  // Ouvrir automatiquement le modal de projet si demandé via URL
  useEffect(() => {
    if (openProjectModal) {
      setActiveTab('projets')
      setIsProjectModalOpen(true)
    }
  }, [openProjectModal])

  // Auto-refresh des données quand on revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        router.refresh()
      }
    }

    const handleFocus = () => {
      router.refresh()
    }

    // Écouter quand l'utilisateur revient sur l'onglet
    document.addEventListener('visibilitychange', handleVisibilityChange)
    // Écouter quand la fenêtre reçoit le focus
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [router])

  return (
    <div className="overflow-x-visible">
      <div className="space-y-6">
        {/* Info client */}
        <div className="bg-card rounded-lg border p-6">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        {client.company && (
          <p className="text-muted-foreground mb-4">{client.company}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('clients.email')}</p>
            <p>{client.email}</p>
          </div>

          {client.phone && (
            <div>
              <p className="text-sm text-muted-foreground">{t('clients.phone')}</p>
              <p>{client.phone}</p>
            </div>
          )}

          {client.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">{t('clients.address')}</p>
              <p>{client.address}</p>
            </div>
          )}

          {client.website && (
            <div>
              <p className="text-sm text-muted-foreground">{t('clients.website')}</p>
              <a
                href={client.website}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {client.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Onglets CRM */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('crm.overviewTab')}</TabsTrigger>
          <TabsTrigger value="projects">
            {t('crm.projectsTab')} ({client.projects.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            {t('crm.invoicesTab')} ({client.invoices.length})
          </TabsTrigger>
          <TabsTrigger value="notes">{t('crm.notesTab')} ({client.notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            client={client}
            onCreateProject={() => {
              setIsProjectModalOpen(true)
              setActiveTab('projects')
            }}
            onCreateInvoice={() => {
              setSelectedProjectForInvoice(null)
              setIsInvoiceModalOpen(true)
            }}
            onCreateInvoiceForProject={(projectId: string) => {
              setSelectedProjectForInvoice(projectId)
              setIsInvoiceModalOpen(true)
            }}
            onAddNote={() => {
              setIsNoteModalOpen(true)
              setActiveTab('notes')
            }}
          />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsTab
            client={client}
            externalProjectModalOpen={isProjectModalOpen}
            onExternalProjectModalClose={() => setIsProjectModalOpen(false)}
          />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6 overflow-x-hidden">
          <InvoicesTab client={client} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <NotesTab
            client={client}
            externalNoteModalOpen={isNoteModalOpen}
            onExternalNoteModalClose={() => setIsNoteModalOpen(false)}
          />
        </TabsContent>
      </Tabs>
      </div>

      {/* Invoice Modal (punctual or for project) */}
      <CreateInvoiceForProjectModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false)
          setSelectedProjectForInvoice(null)
        }}
        onSave={async (items: { description: string; amount: number }[], dueDate: string) => {
          // Create the invoice directly with items
          const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId: client.id,
              projectId: selectedProjectForInvoice,
              items,
              dueDate: new Date(dueDate).toISOString(),
            }),
          })

          if (res.ok) {
            setIsInvoiceModalOpen(false)
            setSelectedProjectForInvoice(null)
            router.refresh()
          }
        }}
        project={
          selectedProjectForInvoice
            ? client.projects.find((p) => p.id === selectedProjectForInvoice) || null
            : null
        }
        client={!selectedProjectForInvoice ? { id: client.id, name: client.name } : undefined}
      />
    </div>
  )
}

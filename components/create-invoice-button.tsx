'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Folder } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createPortal } from 'react-dom'

type Client = {
  id: string
  name: string
  company?: string | null
}

type Project = {
  id: string
  name: string
  clientId: string
  client: {
    id: string
    name: string
  }
}

export function CreateInvoiceButton() {
  const router = useRouter()
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  // Load clients when client modal opens
  useEffect(() => {
    if (showClientModal) {
      setLoading(true)
      fetch('/api/clients')
        .then(res => res.json())
        .then(data => {
          setClients(data.filter((c: Client & { archived?: boolean }) => !c.archived))
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [showClientModal])

  // Load projects when project modal opens
  useEffect(() => {
    if (showProjectModal) {
      setLoading(true)
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => {
          setProjects(data.filter((p: Project & { status?: string }) => p.status === 'active'))
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [showProjectModal])

  const createInvoice = async (clientId: string, projectId?: string) => {
    setCreating(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          projectId,
          items: [
            {
              description: '',
              amount: 0,
            }
          ]
        }),
      })

      if (res.ok) {
        const invoice = await res.json()
        // Close modals
        setShowClientModal(false)
        setShowProjectModal(false)
        // Refresh and redirect
        router.refresh()
        router.push(`/invoices?view=${invoice.id}`)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleClientSelect = (clientId: string) => {
    createInvoice(clientId)
  }

  const handleProjectSelect = (project: Project) => {
    createInvoice(project.clientId, project.id)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setShowClientModal(true)}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2" />
            Facture ponctuelle
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowProjectModal(true)}
            className="cursor-pointer"
          >
            <Folder className="h-4 w-4 mr-2" />
            Facture projet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Client Selection Modal */}
      {showClientModal && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => !creating && setShowClientModal(false)}
          />
          <div className="relative bg-background border rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Sélectionner un client</h2>
              <button
                className="text-sm underline"
                onClick={() => setShowClientModal(false)}
                disabled={creating}
              >
                Annuler
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement...
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun client disponible. Créez un client d&apos;abord.
                </div>
              ) : (
                <div className="space-y-2">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => handleClientSelect(client.id)}
                      disabled={creating}
                      className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="font-medium">{client.name}</p>
                      {client.company && (
                        <p className="text-sm text-muted-foreground">{client.company}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Project Selection Modal */}
      {showProjectModal && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => !creating && setShowProjectModal(false)}
          />
          <div className="relative bg-background border rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Sélectionner un projet</h2>
              <button
                className="text-sm underline"
                onClick={() => setShowProjectModal(false)}
                disabled={creating}
              >
                Annuler
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun projet actif disponible.
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      disabled={creating}
                      className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Client: {project.client.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

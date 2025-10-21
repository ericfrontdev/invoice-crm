'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/client-card'
import {
  Grid,
  List,
  Mail,
  Phone,
  Globe,
  MapPin,
  ArrowRight,
  Pencil,
  Users,
} from 'lucide-react'
import { NewClientModal, type NewClientData } from '@/components/new-client-modal'
import { EditClientModal, type EditClientData } from '@/components/edit-client-modal'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
  createdAt: Date
  userId: string
}

export function ClientsView({ clients }: { clients: Client[] }) {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const router = useRouter()

  const handleNewClient = async (clientData: NewClientData) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      })
      if (!res.ok) {
        setToast({ type: 'error', message: "Erreur lors de la création du client" })
        setTimeout(() => setToast(null), 3000)
        return
      }
      router.refresh()
      setToast({ type: 'success', message: 'Client créé avec succès' })
      setTimeout(() => setToast(null), 2500)
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleEditClient = async (clientData: EditClientData) => {
    if (!editingClient) return
    try {
      const res = await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      })
      if (!res.ok) {
        setToast({ type: 'error', message: "Erreur lors de la modification du client" })
        setTimeout(() => setToast(null), 3000)
        return
      }
      router.refresh()
      setToast({ type: 'success', message: 'Client modifié avec succès' })
      setTimeout(() => setToast(null), 2500)
      setEditingClient(null)
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleCardClick = (client: Client) => {
    if (isEditMode) {
      setEditingClient(client)
    } else {
      router.push(`/clients/${client.id}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isEditMode && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">Mode édition activé</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Cliquez sur un client pour modifier ses informations</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(false)}
            className="cursor-pointer border-blue-500 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40"
          >
            Quitter le mode édition
          </Button>
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>

        <div className="flex items-center gap-4">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="cursor-pointer"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="cursor-pointer"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="cursor-pointer"
            disabled={clients.length === 0}
          >
            <Pencil className="h-4 w-4 mr-2" />
            {isEditMode ? 'Mode édition' : 'Éditer'}
          </Button>

          <Button
            className="cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            + Nouveau client
          </Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Aucun client</p>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            className="mt-4 cursor-pointer"
          >
            Créer le premier client
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isEditMode={isEditMode}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className={`bg-card border rounded-lg p-6 hover:shadow-md transition-shadow ${isEditMode ? 'cursor-pointer ring-2 ring-blue-500 ring-offset-2 hover:ring-blue-600' : ''}`}
              onClick={() => isEditMode && handleCardClick(client)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Colonne 1 - Identité */}
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {client.company}
                      </p>
                    )}
                  </div>

                  {/* Colonne 2 - Contact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{client.email}</p>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{client.phone}</p>
                      </div>
                    )}
                    {client.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={client.website}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Site web
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Colonne 3 - Adresse */}
                  <div>
                    {client.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{client.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton action */}
                {!isEditMode && (
                  <div className="ml-4">
                    <Button
                      size="sm"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/clients/${client.id}`)
                      }}
                    >
                      Gérer factures <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewClient}
      />
      <EditClientModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSubmit={handleEditClient}
        client={editingClient}
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
    </div>
  )
}

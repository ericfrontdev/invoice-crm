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
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import {
  NewClientModal,
  type NewClientData,
} from '@/components/new-client-modal'
import {
  EditClientModal,
  type EditClientData,
} from '@/components/edit-client-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
  archived: boolean
  archivedAt: Date | null
  createdAt: Date
  userId: string
}

export function ClientsView({
  clients,
  showArchived,
}: {
  clients: Client[]
  showArchived: boolean
}) {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToArchive, setClientToArchive] = useState<Client | null>(null)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const router = useRouter()

  const handleNewClient = async (clientData: NewClientData) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      })
      if (!res.ok) {
        setToast({
          type: 'error',
          message: 'Erreur lors de la création du client',
        })
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
        setToast({
          type: 'error',
          message: 'Erreur lors de la modification du client',
        })
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

  const handleArchiveClick = (client: Client) => {
    setClientToArchive(client)
    setIsArchiveDialogOpen(true)
  }

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    if (!clientToArchive) return

    try {
      const res = await fetch(`/api/clients/${clientToArchive.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        setToast({
          type: 'error',
          message: "Erreur lors de l'archivage du client",
        })
        setTimeout(() => setToast(null), 3000)
        return
      }

      router.refresh()
      setToast({ type: 'success', message: 'Client archivé avec succès' })
      setTimeout(() => setToast(null), 2500)
      setIsArchiveDialogOpen(false)
      setClientToArchive(null)
      setIsEditMode(false) // Désactiver le mode édition après archivage
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleRestore = async (client: Client) => {
    try {
      const res = await fetch(`/api/clients/${client.id}/restore`, {
        method: 'POST',
      })

      if (!res.ok) {
        setToast({
          type: 'error',
          message: 'Erreur lors de la restauration du client',
        })
        setTimeout(() => setToast(null), 3000)
        return
      }

      router.refresh()
      setToast({ type: 'success', message: 'Client restauré avec succès' })
      setTimeout(() => setToast(null), 2500)
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return

    try {
      const res = await fetch(
        `/api/clients/${clientToDelete.id}?permanent=true`,
        {
          method: 'DELETE',
        }
      )

      if (!res.ok) {
        setToast({
          type: 'error',
          message: 'Erreur lors de la suppression du client',
        })
        setTimeout(() => setToast(null), 3000)
        return
      }

      router.refresh()
      setToast({ type: 'success', message: 'Client supprimé définitivement' })
      setTimeout(() => setToast(null), 2500)
      setIsDeleteDialogOpen(false)
      setClientToDelete(null)
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isEditMode && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Mode édition activé
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Cliquez sur un client pour modifier ses informations
              </p>
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
      <div className="flex justify-between flex-wrap items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            {showArchived ? 'Clients archivés' : 'Clients'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle pour voir les clients archivés */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newUrl = showArchived
                ? '/clients'
                : '/clients?archived=true'
              router.push(newUrl)
            }}
            className="cursor-pointer mt-2 md:mt-0"
          >
            {showArchived ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Voir les clients actifs
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Voir les archivés
              </>
            )}
          </Button>

          {!showArchived && (
            <>
              <div className="flex border rounded-md mt-2 md:mt-0">
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
                className="cursor-pointer mt-2 md:mt-0"
                disabled={clients.length === 0}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditMode ? 'Mode édition' : 'Éditer'}
              </Button>

              <Button
                className="cursor-pointer mt-2 md:mt-0"
                onClick={() => setIsModalOpen(true)}
              >
                + Nouveau client
              </Button>
            </>
          )}
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {showArchived ? (
            <>
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Aucun client archivé</p>
            </>
          ) : (
            <>
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Aucun client</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="mt-4 cursor-pointer"
              >
                Créer le premier client
              </Button>
            </>
          )}
        </div>
      ) : showArchived ? (
        // Vue pour les clients archivés (pas de cartes flip, juste liste avec boutons)
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="relative bg-card border rounded-lg p-6"
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
                  </div>

                  {/* Colonne 3 - Date archivage */}
                  <div className="text-sm text-muted-foreground">
                    Archivé le{' '}
                    {client.archivedAt
                      ? new Date(client.archivedAt).toLocaleDateString('fr-FR')
                      : '-'}
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="ml-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => handleRestore(client)}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restaurer
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => handleDeleteClick(client)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              isEditMode={isEditMode}
              onCardClick={handleCardClick}
              onArchive={handleArchiveClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className={`relative bg-card border rounded-lg p-6 hover:shadow-md transition-shadow ${isEditMode ? 'cursor-pointer ring-2 ring-blue-500 ring-offset-2 hover:ring-blue-600' : ''}`}
              onClick={() => isEditMode && handleCardClick(client)}
            >
              {/* Archive button - only visible in edit mode */}
              {isEditMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleArchiveClick(client)
                  }}
                  className="absolute -top-2 -right-2 z-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                  aria-label="Archiver le client"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}

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

      {/* Archive Confirmation Dialog */}
      <AlertDialog
        open={isArchiveDialogOpen}
        onOpenChange={setIsArchiveDialogOpen}
      >
        <AlertDialogContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 grid place-items-center">
              <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <AlertDialogHeader>
                <AlertDialogTitle>Archiver le client</AlertDialogTitle>
                <AlertDialogDescription>
                  Voulez-vous archiver le client &ldquo;{clientToArchive?.name}
                  &rdquo; ? Le client sera masqué de la liste principale mais
                  ses factures et projets seront conservés. Vous pourrez le
                  restaurer à tout moment depuis la section &quot;Clients
                  archivés&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmArchive}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog (permanent delete for archived clients) */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 grid place-items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Supprimer définitivement le client
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer définitivement le client
                  &ldquo;{clientToDelete?.name}&rdquo; ? Cette action est
                  irréversible et supprimera également tous les projets,
                  factures et données associés à ce client.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

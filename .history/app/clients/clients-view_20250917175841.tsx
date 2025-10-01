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
} from 'lucide-react'
import {
  NewClientModal,
  type NewClientData,
} from '@/components/new-client-modal'

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

  const handleNewClient = (clientData: NewClientData) => {
    console.log('Nouveau client:', clientData)
    // TODO: Appeler l<API pour cr/>er le client
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>

        <div className="flex items-center gap-4">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => setIsModalOpen(true)}>+ Nouveau client</Button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
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
                <div className="ml-4">
                  <Button size="sm">
                    Gérer factures <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
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
    </div>
  )
}

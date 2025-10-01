'use client'

import { useState } from 'react'
import { Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/client-card'

type Client = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
}

export function ClientsView({ clients }: { clients: Client[] }) {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

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

          <Button>+ Nouveau client</Button>
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
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-card border rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {client.company}
                  </p>
                  <p className="text-sm">{client.email}</p>
                </div>
                <Button size="sm">Gérer factures</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

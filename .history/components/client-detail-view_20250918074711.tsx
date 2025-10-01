'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ClientWithAmounts = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
  unpaidAmounts: Array<{
    id: string
    amount: number
    description: string
    date: Date
    dueDate: Date | null
    status: string
  }>
}

export function ClientDetailView({ client }: { client: ClientWithAmounts }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      {/* Section infos client - fixe */}
      <div className="bg-card rounded-lg border p-6 mb-4">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        {client.company && (
          <p className="text-muted-foreground mb-2">{client.company}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{client.email}</p>
          </div>

          {client.phone && (
            <div>
              <p className="text-sm text-muted-foreground">Téléphone</p>
              <p>{client.phone}</p>
            </div>
          )}

          {client.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p>{client.address}</p>
            </div>
          )}

          {client.website && (
            <div>
              <p className="text-sm text-muted-foreground">Site web</p>
              <a
                href={client.website}
                className="text-blue-600 hover:underline"
              >
                {client.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bouton sommes dues */}
      <Button
        variant="outline"
        className="w-full mb-0 rounded-b-none border-b-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-medium">
            Sommes dues ({client.unpaidAmounts.length})
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </Button>

      {/* Section sommes dues - slide down */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="bg-muted/30 border border-t-0 rounded-b-lg p-6">
          <h3 className="font-semibold mb-4">Montants non payés</h3>

          {client.unpaidAmounts.length > 0 ? (
            <div className="space-y-3">
              {client.unpaidAmounts.map((amount) => (
                <div
                  key={amount.id}
                  className="bg-background rounded-lg p-4 border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{amount.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Créé: {new Date(amount.date).toLocaleDateString()}
                      </p>
                      {amount.dueDate && (
                        <p className="text-sm text-orange-600">
                          Échéance:{' '}
                          {new Date(amount.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {amount.amount.toFixed(2)} $
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun montant dû</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

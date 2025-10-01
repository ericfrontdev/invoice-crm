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
      <div className="bg-card rounded-lg border p-6 mb-8">
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

      {/* Bouton révélateur centré */}
      <div className="flex justify-center mb-0">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-12 py-4 relative z-10"
        >
          <div className="flex flex-col items-center">
            <span className="font-medium mb-2">
              Voir les sommes dues ({client.unpaidAmounts.length})
            </span>
            {/* 4 flèches réparties */}
            <div className="flex justify-between w-full space-x-8">
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <ChevronUp className="h-4 w-4" />
                  <ChevronUp className="h-4 w-4" />
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </div>
          </div>
        </Button>
      </div>

      {/* Section qui slide - background pleine largeur écran */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="overflow-hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-slate-100 dark:bg-slate-800"
      >
        <div className="container mx-auto px-4 py-8">
          <h3 className="text-xl font-semibold mb-6 text-center">
            Sommes dues
          </h3>

          {client.unpaidAmounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-slate-700 rounded-lg shadow-md">
                <thead className="bg-gray-50 dark:bg-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Date création
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Date échéance
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Montant
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Sélection
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {client.unpaidAmounts.map((amount) => (
                    <tr
                      key={amount.id}
                      className="border-t hover:bg-gray-50 dark:hover:bg-slate-600"
                    >
                      <td className="py-4 px-4">{amount.description}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {new Date(amount.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {amount.dueDate
                          ? new Date(amount.dueDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        {amount.amount.toFixed(2)} $
                      </td>
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Aucun montant dû
            </p>
          )}

          {client.unpaidAmounts.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button>Générer facture pour les éléments sélectionnés</Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

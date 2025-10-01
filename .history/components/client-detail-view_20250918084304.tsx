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
  const [selectedAmounts, setSelectedAmounts] = useState<Set<string>>(new Set())

  const handleCheckboxChange = (amountId: string) => {
    const newSelected = new Set(selectedAmounts)
    if (newSelected.has(amountId)) {
      newSelected.delete(amountId)
    } else {
      newSelected.add(amountId)
    }
    setSelectedAmounts(newSelected)
  }

  const hasSelectedAmounts = selectedAmounts.size > 0
  const totalSelected = client.unpaidAmounts
    .filter((amount) => selectedAmounts.has(amount.id))
    .reduce((sum, amount) => sum + amount.amount, 0)

  return (
    <div className="overflow-x-hidden">
      {/* Section infos client - reste identique */}
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

      {/* Bouton révélateur centré - reste identique */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-8 py-4"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}

            <span className="font-medium">
              {isExpanded
                ? `Masquer les sommes dues`
                : `Voir les sommes dues (${client.unpaidAmounts.length})`}
            </span>

            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </Button>
      </div>

      {/* Section qui slide */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div
          className="w-screen bg-slate-100 dark:bg-slate-800 py-8"
          style={{ marginLeft: 'calc(-50vw + 50%)' }}
        >
          <div className="container mx-auto px-4">
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
                            checked={selectedAmounts.has(amount.id)}
                            onChange={() => handleCheckboxChange(amount.id)}
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
              <div className="mt-6 flex flex-col items-center gap-4">
                {hasSelectedAmounts && (
                  <p className="text-sm text-muted-foreground">
                    Total sélectionné:{' '}
                    <span className="font-semibold">
                      {totalSelected.toFixed(2)} $
                    </span>
                  </p>
                )}
                <Button disabled={!hasSelectedAmounts}>
                  Générer facture pour les éléments sélectionnés
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

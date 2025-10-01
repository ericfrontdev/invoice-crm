'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddAmountModal, type NewAmountData } from '@/components/add-amount-modal'
import { EditAmountModal, type EditAmountData } from '@/components/edit-amount-modal'
import { InvoicePreviewModal } from '@/components/invoice-preview-modal'

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
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingAmount, setEditingAmount] = useState<ClientWithAmounts['unpaidAmounts'][0] | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleCheckboxChange = (amountId: string) => {
    const newSelected = new Set(selectedAmounts)
    if (newSelected.has(amountId)) {
      newSelected.delete(amountId)
    } else {
      newSelected.add(amountId)
    }
    setSelectedAmounts(newSelected)
  }

  const handleEditAmount = async (amountData: EditAmountData) => {
    if (!editingAmount) return
    try {
      const res = await fetch(`/api/unpaid-amounts/${editingAmount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amountData),
      })
      if (!res.ok) {
        setToast({ type: 'error', message: "Erreur lors de la modification du montant" })
        setTimeout(() => setToast(null), 3000)
        return
      }
      router.refresh()
      setToast({ type: 'success', message: 'Montant modifié avec succès' })
      setTimeout(() => setToast(null), 2500)
      setEditingAmount(null)
    } catch {
      setToast({ type: 'error', message: 'Erreur réseau' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleAmountClick = (amount: ClientWithAmounts['unpaidAmounts'][0], e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation()
      setEditingAmount(amount)
    }
  }

  const hasSelectedAmounts = selectedAmounts.size > 0
  const totalSelected = client.unpaidAmounts
    .filter((amount) => selectedAmounts.has(amount.id))
    .reduce((sum, amount) => sum + amount.amount, 0)

  return (
    <div className="overflow-x-hidden">
      {/* Section infos client - fixe */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-card rounded-lg border p-6">
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
      </div>

      {/* Bouton révélateur centré - reste identique */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-8 py-4 cursor-pointer"
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
            {isEditMode && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Pencil className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Mode édition activé</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Cliquez sur un montant pour le modifier</p>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Sommes dues</h3>
              <div className="flex gap-2">
                <Button
                  variant={isEditMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="cursor-pointer"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Mode édition' : 'Éditer'}
                </Button>
                <Button size="sm" className="cursor-pointer" onClick={() => setIsAddOpen(true)}>
                  + Ajouter un montant
                </Button>
              </div>
            </div>

            {client.unpaidAmounts.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
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
                        {!isEditMode && (
                          <th className="text-center py-3 px-4 font-medium">
                            Sélection
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {client.unpaidAmounts.map((amount) => (
                        <tr
                          key={amount.id}
                          className={`border-t hover:bg-gray-50 dark:hover:bg-slate-600 ${isEditMode ? 'cursor-pointer ring-2 ring-inset ring-blue-500' : ''}`}
                          onClick={(e) => handleAmountClick(amount, e)}
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
                          {!isEditMode && (
                            <td className="py-4 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={selectedAmounts.has(amount.id)}
                                onChange={() => handleCheckboxChange(amount.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {client.unpaidAmounts.map((amount) => (
                    <div
                      key={amount.id}
                      className={`bg-white dark:bg-slate-700 rounded-lg p-4 shadow-md border ${isEditMode ? 'cursor-pointer ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      onClick={(e) => handleAmountClick(amount, e)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-base mb-2">
                            {amount.description}
                          </h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              Créé: {new Date(amount.date).toLocaleDateString()}
                            </p>
                            <p>
                              Échéance:{' '}
                              {amount.dueDate
                                ? new Date(amount.dueDate).toLocaleDateString()
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-lg">
                            {amount.amount.toFixed(2)} $
                          </p>
                        </div>
                      </div>

                      {!isEditMode && (
                        <div className="flex justify-center pt-3 border-t">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedAmounts.has(amount.id)}
                              onChange={() => handleCheckboxChange(amount.id)}
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            />
                            <span className="text-sm">
                              Sélectionner pour facturation
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Aucun montant dû
              </p>
            )}

            {client.unpaidAmounts.length > 0 && !isEditMode && (
              <div className="mt-6 flex flex-col items-center gap-4">
                {hasSelectedAmounts && (
                  <p className="text-sm text-muted-foreground">
                    Total sélectionné:{' '}
                    <span className="font-semibold">
                      {totalSelected.toFixed(2)} $
                    </span>
                  </p>
                )}
                <Button
                  className="cursor-pointer"
                  disabled={!hasSelectedAmounts || isGenerating}
                  onClick={() => {
                    if (!hasSelectedAmounts || isGenerating) return
                    const ids = Array.from(selectedAmounts)
                    setIsGenerating(true)
                    ;(async () => {
                      try {
                        const res = await fetch('/api/invoices', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ clientId: client.id, unpaidAmountIds: ids }),
                        })
                        if (!res.ok) {
                          setToast({ type: 'error', message: 'Erreur lors de la création de la facture' })
                        } else {
                          setToast({ type: 'success', message: 'Facture générée (brouillon)' })
                          setSelectedAmounts(new Set())
                          router.refresh()
                        }
                      } catch {
                        setToast({ type: 'error', message: 'Erreur réseau' })
                      } finally {
                        setIsGenerating(false)
                        setTimeout(() => setToast(null), 2500)
                      }
                    })()
                  }}
                >
                  {isGenerating ? 'Génération…' : 'Générer facture pour les éléments sélectionnés'}
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={!hasSelectedAmounts}
                  onClick={() => setIsPreviewOpen(true)}
                >
                  Prévisualiser
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal ajout montant */}
      <AddAmountModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={(data: NewAmountData) => {
          // Appel API pour créer un montant, puis refresh
          ;(async () => {
            try {
              const res = await fetch('/api/unpaid-amounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, clientId: client.id }),
              })
              if (!res.ok) {
                setToast({ type: 'error', message: "Erreur lors de l'ajout du montant" })
              } else {
                router.refresh()
                setToast({ type: 'success', message: 'Montant ajouté' })
              }
            } catch {
              setToast({ type: 'error', message: 'Erreur réseau' })
            } finally {
              setIsAddOpen(false)
              setTimeout(() => setToast(null), 2500)
            }
          })()
        }}
      />
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        client={{
          id: client.id,
          name: client.name,
          company: client.company,
          email: client.email,
          address: client.address,
        }}
        items={client.unpaidAmounts
          .filter((a) => selectedAmounts.has(a.id))
          .map((a) => ({ id: a.id, description: a.description, amount: a.amount, date: a.date }))}
        onCreated={() => {
          setSelectedAmounts(new Set())
          router.refresh()
          setToast({ type: 'success', message: 'Facture créée' })
          setTimeout(() => setToast(null), 2500)
        }}
      />
      <EditAmountModal
        isOpen={!!editingAmount}
        onClose={() => setEditingAmount(null)}
        onSubmit={handleEditAmount}
        amount={editingAmount}
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

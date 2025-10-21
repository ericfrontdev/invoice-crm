'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Globe, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export function ClientCard({
  client,
  isEditMode = false,
  onCardClick,
  onDelete
}: {
  client: Client
  isEditMode?: boolean
  onCardClick?: (client: Client) => void
  onDelete?: (client: Client) => void
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (isEditMode && onCardClick) {
      onCardClick(client)
    } else {
      setIsFlipped(!isFlipped)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(client)
    }
  }

  return (
    <div
      className={`relative h-48 w-full perspective-1000 ${isEditMode ? 'cursor-pointer ring-2 ring-blue-500 ring-offset-2 hover:ring-blue-600' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      {/* Delete button - only visible in edit mode */}
      {isEditMode && onDelete && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
          aria-label="Supprimer le client"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Card Container */}
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        whileHover={{ rotateY: isFlipped ? 185 : 5 }}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden rounded-lg border bg-card p-6 shadow-md">
          <div className="flex flex-col h-full">
            <h3 className="font-semibold text-lg mb-1">{client.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {client.company}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{client.email}</p>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Cliquer pour plus d&apos;infos
              </p>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rounded-lg border bg-secondary px-6 py-4 shadow-md rotate-y-180">
          <div className="flex flex-col h-full">
            <h3 className="font-semibold text-lg mb-3">{client.name}</h3>

            <div className="space-y-1 flex-1">
              {/* Téléphone */}
              <div className="flex items-center gap-2 h-5">
                {client.phone && (
                  <>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{client.phone}</p>
                  </>
                )}
              </div>

              {/* Adresse - plus compact */}
              <div className="flex items-start gap-2 h-6">
                {client.address && (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs line-clamp-2">{client.address}</p>
                  </>
                )}
              </div>

              {/* Site web */}
              <div className="flex items-center gap-2 h-5">
                {client.website && (
                  <>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={client.website}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Site web
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation() // Empêche le flip de la carte
                  router.push(`/clients/${client.id}`)
                }}
              >
                Voir les sommes dues
              </Button>
              <Button
                size="sm"
                className="flex-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation() // Empêche le flip de la carte
                  router.push(`/clients/${client.id}/details`)
                }}
              >
                Détails du client
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

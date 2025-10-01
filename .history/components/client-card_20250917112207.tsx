'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Client = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  website: string
}

export function ClientCard({ client }: { client: Client }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="relative h-48 w-full cursor-pointer perspective-1000 transition-transform duration-200 hover:scale-105"
      // onMouseEnter={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Card Container */}
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
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
            <div className="mt-auto">
              <p className="text-xs text-muted-foreground">
                Cliquer pour plus d infos
              </p>
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

            <Button
              size="sm"
              className="mt-4"
            >
              Gérer factures <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

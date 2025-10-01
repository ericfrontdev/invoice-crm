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
      className="relative h-48 w-full cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Card Container */}
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        whileHover={{ scale: 1.02, rotateX: 5 }}
      >
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
            <div>
              <p></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

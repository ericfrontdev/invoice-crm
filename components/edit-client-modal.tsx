'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type EditClientData = {
  name: string
  company?: string
  email: string
  phone?: string
  address?: string
  website?: string
}

type Client = {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  address: string | null
  website: string | null
}

export function EditClientModal({
  isOpen,
  onClose,
  onSubmit,
  client,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EditClientData) => void
  client: Client | null
}) {
  const [formData, setFormData] = useState<EditClientData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  })

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        company: client.company || '',
        email: client.email,
        phone: client.phone || '',
        address: client.address || '',
        website: client.website || '',
      })
    }
  }, [client])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen || !client) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-black/50 overlay-blur" onClick={onClose} />

      <div className="relative bg-background border rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <h2 className="text-lg font-semibold">Modifier le client</h2>
          <button className="text-sm underline" onClick={onClose}>
            Fermer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Annuler
            </Button>
            <Button type="submit" className="cursor-pointer">
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

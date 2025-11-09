'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Building2, Mail, Phone, MapPin, Globe, User, Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n-context'

export interface NewClientData {
  name: string
  company: string
  email: string
  phone: string
  address: string
  website: string
}

interface NewClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (clientData: NewClientData) => void
}

export function NewClientModal({
  isOpen,
  onClose,
  onSubmit,
}: NewClientModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await Promise.resolve(onSubmit(formData))
      setFormData({ name: '', company: '', email: '', phone: '', address: '', website: '' })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-client-title"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background border rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <h2 id="new-client-title" className="text-base font-semibold">{t('clients.newClient')}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Identité */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{t('clients.identity')}</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> {t('clients.name')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Jean Tremblay"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {t('clients.company')}
                </Label>
                <Input
                  id="company"
                  placeholder="Ex: Tremblay Construction"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{t('clients.contact')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {t('clients.email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@domaine.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {t('clients.phone')}
                </Label>
                <Input
                  id="phone"
                  placeholder="Ex: 514-555-0123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{t('clients.coordinates')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {t('clients.address')}
                </Label>
                <Input
                  id="address"
                  placeholder="Rue, ville, code postal"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" /> {t('clients.website')}
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://exemple.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t('common.loading')}
                </span>
              ) : (
                t('clients.newClient')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

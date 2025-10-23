'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  neq: string | null
  tpsNumber: string | null
  tvqNumber: string | null
  chargesTaxes: boolean
  paymentProvider: string | null
  paypalEmail: string | null
  stripeAccountId: string | null
  logo: string | null
}

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    company: user.company || '',
    phone: user.phone || '',
    address: user.address || '',
    neq: user.neq || '',
    tpsNumber: user.tpsNumber || '',
    tvqNumber: user.tvqNumber || '',
    chargesTaxes: user.chargesTaxes,
    paymentProvider: user.paymentProvider || '',
    paypalEmail: user.paypalEmail || '',
    stripeAccountId: user.stripeAccountId || '',
  })
  const [logo, setLogo] = useState<string | null>(user.logo)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const uploadFile = async (file: File) => {
    setIsUploadingLogo(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch('/api/user/logo', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur lors de l\'upload')
      }

      const data = await res.json()
      setLogo(data.logoUrl)
      setMessage({ type: 'success', text: 'Logo uploadé avec succès' })
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l\'upload du logo'
      })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Le fichier doit être une image' })
      return
    }

    await uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleLogoDelete = async () => {
    setIsUploadingLogo(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/logo', {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      setLogo(null)
      setMessage({ type: 'success', text: 'Logo supprimé avec succès' })
      router.refresh()
    } catch (_error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression du logo' })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
      router.refresh()
    } catch (_error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2 block">Nom complet *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="mb-2 block">Adresse courriel *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="company" className="mb-2 block">Nom de compagnie</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        {/* Logo */}
        <div className="pt-4 border-t">
          <Label className="mb-2 block">Logo pour les factures</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Le logo apparaîtra sur vos factures. Format: PNG, JPG, SVG (max 5MB)
          </p>

          {logo ? (
            <div className="flex items-start gap-4">
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-white">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={isUploadingLogo}
                  className="cursor-pointer"
                >
                  {isUploadingLogo ? 'Upload en cours...' : 'Changer le logo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogoDelete}
                  disabled={isUploadingLogo}
                  className="cursor-pointer"
                >
                  Supprimer le logo
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              } ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isUploadingLogo && document.getElementById('logo-upload')?.click()}
            >
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm font-medium">
                {isUploadingLogo
                  ? 'Upload en cours...'
                  : isDragging
                  ? 'Déposez le fichier ici'
                  : 'Glissez-déposez un logo ou cliquez pour choisir'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG ou SVG (max 5MB)
              </p>
            </div>
          )}
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            disabled={isUploadingLogo}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-2 block">Numéro de téléphone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="address" className="mb-2 block">Adresse postale</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Champs spécifiques Québec */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">Informations fiscales</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="neq" className="mb-2 block">
                NEQ (Numéro d&apos;entreprise du Québec)
              </Label>
              <Input
                id="neq"
                value={formData.neq}
                onChange={(e) => setFormData({ ...formData, neq: e.target.value })}
                placeholder="Ex: 1234567890"
              />
            </div>

            <div>
              <Label htmlFor="tpsNumber" className="mb-2 block">
                Numéro TPS (fédéral)
              </Label>
              <Input
                id="tpsNumber"
                value={formData.tpsNumber}
                onChange={(e) => setFormData({ ...formData, tpsNumber: e.target.value })}
                placeholder="Ex: 123456789RT0001"
              />
            </div>

            <div>
              <Label htmlFor="tvqNumber" className="mb-2 block">
                Numéro TVQ (provincial)
              </Label>
              <Input
                id="tvqNumber"
                value={formData.tvqNumber}
                onChange={(e) => setFormData({ ...formData, tvqNumber: e.target.value })}
                placeholder="Ex: 1234567890TQ0001"
              />
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="chargesTaxes"
                checked={formData.chargesTaxes}
                onChange={(e) => setFormData({ ...formData, chargesTaxes: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <Label htmlFor="chargesTaxes" className="cursor-pointer font-medium">
                  Charger les taxes TPS/TVQ sur mes factures
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Activez cette option si votre chiffre d&apos;affaires dépasse 30 000$ par année et que vous êtes inscrit aux fichiers de la TPS et de la TVQ.
                  Les taxes seront automatiquement calculées sur toutes vos nouvelles factures.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration des paiements */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">Configuration des paiements</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configurez PayPal ou Stripe pour permettre à vos clients de payer leurs factures en ligne.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentProvider" className="mb-2 block">
                Fournisseur de paiement
              </Label>
              <select
                id="paymentProvider"
                value={formData.paymentProvider}
                onChange={(e) => setFormData({ ...formData, paymentProvider: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Aucun (paiements désactivés)</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {formData.paymentProvider === 'paypal' && (
              <div>
                <Label htmlFor="paypalEmail" className="mb-2 block">
                  Adresse courriel PayPal
                </Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                  placeholder="votre-email@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cette adresse sera utilisée pour recevoir les paiements PayPal de vos clients.
                </p>
              </div>
            )}

            {formData.paymentProvider === 'stripe' && (
              <div>
                <Label className="mb-2 block">
                  Connexion Stripe
                </Label>

                {formData.stripeAccountId ? (
                  // Compte Stripe déjà connecté
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Compte Stripe connecté
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          ID: {formData.stripeAccountId}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, stripeAccountId: '' })}
                      className="cursor-pointer"
                    >
                      Déconnecter Stripe
                    </Button>
                  </div>
                ) : (
                  // Pas encore connecté
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connectez votre compte Stripe pour recevoir les paiements directement.
                      Les fonds iront automatiquement sur votre compte Stripe.
                    </p>
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => {
                        // Rediriger vers l'API de connexion Stripe OAuth
                        window.location.href = '/api/stripe/connect'
                      }}
                      className="cursor-pointer"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                      </svg>
                      Connecter avec Stripe
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`rounded-md p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  )
}

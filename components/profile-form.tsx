'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
  stripeSecretKey: string | null
  logo: string | null
  autoRemindersEnabled: boolean
  reminderMiseEnDemeureTemplate: string | null
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
    stripeSecretKey: user.stripeSecretKey || '',
    autoRemindersEnabled: user.autoRemindersEnabled,
    reminderMiseEnDemeureTemplate: user.reminderMiseEnDemeureTemplate || '',
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
                <Label htmlFor="stripeSecretKey" className="mb-2 block">
                  Clé secrète Stripe
                </Label>
                <Input
                  id="stripeSecretKey"
                  type="password"
                  value={formData.stripeSecretKey}
                  onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                  placeholder="sk_test_... ou sk_live_..."
                />
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Créez un compte Stripe sur{' '}
                    <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      stripe.com
                    </a>
                    , puis copiez votre clé secrète depuis <strong>Developers → API keys</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ <strong>Important</strong>: Utilisez la clé <strong>Test</strong> (sk_test_...) pour tester,
                    puis passez à la clé <strong>Live</strong> (sk_live_...) une fois prêt en production.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    🔒 Votre clé est stockée de manière sécurisée et n&apos;est jamais partagée.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration des rappels de paiement */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Rappels de paiement</h3>

          <div className="space-y-4">
            {/* Toggle rappels automatiques */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="autoRemindersEnabled"
                checked={formData.autoRemindersEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoRemindersEnabled: checked as boolean })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="autoRemindersEnabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Activer les rappels automatiques
                </label>
                <p className="text-sm text-muted-foreground">
                  Envoyer automatiquement des rappels de paiement aux clients (J-3, J+1, J+7, J+14)
                </p>
              </div>
            </div>

            {/* Template mise en demeure */}
            {formData.autoRemindersEnabled && (
              <div className="ml-7 space-y-2 pt-2">
                <Label htmlFor="reminderMiseEnDemeureTemplate" className="text-sm">
                  Message de mise en demeure (personnalisable)
                </Label>
                <Textarea
                  id="reminderMiseEnDemeureTemplate"
                  value={formData.reminderMiseEnDemeureTemplate}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderMiseEnDemeureTemplate: e.target.value })
                  }
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="Madame, Monsieur,&#10;&#10;Malgré nos précédents rappels, nous constatons que la facture ci-dessous demeure impayée.&#10;&#10;Nous vous prions de bien vouloir régulariser votre situation dans les plus brefs délais, faute de quoi nous serons contraints d'entamer des procédures de recouvrement.&#10;&#10;Cordialement,"
                />
                <p className="text-xs text-muted-foreground">
                  Ce message sera envoyé dans le 4e rappel (J+14). Les détails de la facture et le bouton de paiement seront ajoutés automatiquement.
                </p>
              </div>
            )}

            {!formData.autoRemindersEnabled && (
              <div className="ml-7 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  Lorsque les rappels automatiques sont désactivés, vous pouvez envoyer des rappels manuels depuis la page de chaque facture.
                </p>
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

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
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
                <Label htmlFor="stripeAccountId" className="mb-2 block">
                  ID du compte Stripe
                </Label>
                <Input
                  id="stripeAccountId"
                  value={formData.stripeAccountId}
                  onChange={(e) => setFormData({ ...formData, stripeAccountId: e.target.value })}
                  placeholder="acct_xxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Vous devez créer un compte Stripe Connect pour accepter les paiements.
                  <a
                    href="https://dashboard.stripe.com/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    Obtenir votre ID de compte Stripe →
                  </a>
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

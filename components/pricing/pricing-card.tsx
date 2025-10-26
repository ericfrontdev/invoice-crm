'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2, AlertCircle } from 'lucide-react'

interface PricingCardProps {
  isBetaTester: boolean
  lifetimeDiscount: number
}

const features = [
  'Clients et projets illimités',
  'Facturation avec TPS/TVQ',
  'Paiements en ligne (Stripe & PayPal)',
  'Rappels automatiques de paiement',
  'CRM avec notes et documents',
  'Comptabilité complète',
  'Support prioritaire',
  'Mises à jour gratuites',
]

export function PricingCard({ isBetaTester, lifetimeDiscount }: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const regularPrice = 29
  const discountedPrice = isBetaTester && lifetimeDiscount > 0
    ? regularPrice * (1 - lifetimeDiscount / 100)
    : regularPrice

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la création de la session')
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Aucune URL de paiement reçue')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Rejoignez SoloPack Pro</h1>
        <p className="text-xl text-muted-foreground">
          La plateforme complète pour gérer votre entreprise
        </p>
      </div>

      {/* Pricing Card */}
      <div className="bg-card border-2 border-primary rounded-xl p-8 shadow-2xl">
        {/* Badge Beta Tester */}
        {isBetaTester && lifetimeDiscount > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-center mb-6 font-semibold">
            🎉 Offre exclusive Beta Tester
          </div>
        )}

        {/* Prix */}
        <div className="text-center mb-8">
          <div className="text-5xl font-bold mb-2">
            {discountedPrice.toFixed(2)}$
            <span className="text-2xl text-muted-foreground font-normal">/mois</span>
          </div>

          {isBetaTester && lifetimeDiscount > 0 && (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="line-through text-muted-foreground text-lg">
                  {regularPrice}$/mois
                </span>
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-3 py-1 rounded-full text-sm font-semibold">
                  -{lifetimeDiscount}% À VIE
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Prix garanti tant que vous restez abonné 🔒
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-base">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          size="lg"
          className="w-full text-lg"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Chargement...
            </>
          ) : (
            'S\'abonner maintenant'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Paiement sécurisé via Stripe • Annulez à tout moment
        </p>
      </div>

      {/* Warning pour beta testers */}
      {isBetaTester && lifetimeDiscount > 0 && (
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">⚠️ Important pour les beta testeurs</p>
              <p>
                Cette offre de {lifetimeDiscount}% de réduction à vie est réservée aux beta testeurs.
                Si vous annulez votre abonnement, vous perdrez cette réduction et devrez payer
                le prix régulier de {regularPrice}$/mois si vous vous réabonnez.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type PaymentButtonProps = {
  invoiceId: string
  total: number
  invoiceNumber: string
  paymentProvider: string
  paypalEmail: string | null
}

export function PaymentButton({
  invoiceId,
  total,
  invoiceNumber,
  paymentProvider,
  paypalEmail,
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayPalPayment = async () => {
    if (!paypalEmail) {
      setError('Email PayPal non configuré')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Rediriger vers PayPal
      const params = new URLSearchParams({
        cmd: '_xclick',
        business: paypalEmail,
        item_name: `Facture ${invoiceNumber}`,
        amount: total.toFixed(2),
        currency_code: 'CAD',
        return: `${window.location.origin}/invoices/${invoiceId}/pay/success`,
        cancel_return: `${window.location.origin}/invoices/${invoiceId}/pay`,
        notify_url: `${window.location.origin}/api/webhooks/paypal`,
        custom: invoiceId,
      })

      window.location.href = `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`
    } catch (err) {
      console.error('PayPal payment error:', err)
      setError('Erreur lors de l\'initialisation du paiement PayPal')
      setIsProcessing(false)
    }
  }

  const handleStripePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Créer une session de paiement Stripe
      const res = await fetch('/api/payments/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la création de la session de paiement')
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      console.error('Stripe payment error:', err)
      setError('Erreur lors de l\'initialisation du paiement Stripe')
      setIsProcessing(false)
    }
  }

  const handlePayment = () => {
    if (paymentProvider === 'paypal') {
      handlePayPalPayment()
    } else if (paymentProvider === 'stripe') {
      handleStripePayment()
    }
  }

  return (
    <div className="w-full max-w-md">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-400/10 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        size="lg"
        className="w-full text-lg cursor-pointer"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Redirection en cours...
          </span>
        ) : (
          <>
            {paymentProvider === 'paypal' && 'Payer avec PayPal'}
            {paymentProvider === 'stripe' && 'Payer avec Stripe'}
          </>
        )}
      </Button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Paiement sécurisé</span>
      </div>
    </div>
  )
}

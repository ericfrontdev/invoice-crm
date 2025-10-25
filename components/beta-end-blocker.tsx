'use client'

import { Button } from '@/components/ui/button'
import { LogOut, CreditCard } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function BetaEndBlocker() {
  const router = useRouter()

  const handleSubscribe = () => {
    // Rediriger vers la page de pricing/abonnement
    router.push('/pricing')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-lg shadow-xl p-8 space-y-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Période bêta terminée</h1>
            <p className="text-muted-foreground">
              La période d&apos;essai gratuit de SoloPack est maintenant terminée. Pour continuer à utiliser l&apos;application, vous devez souscrire à un abonnement.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-sm font-medium mb-2">En vous abonnant, vous bénéficiez de :</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Accès illimité à toutes les fonctionnalités</li>
              <li>• Support prioritaire</li>
              <li>• Mises à jour régulières</li>
              <li>• Sauvegardes automatiques</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleSubscribe}
              size="lg"
              className="w-full"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              S&apos;abonner maintenant
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Se déconnecter
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground pt-4 border-t">
            Vous avez des questions? Contactez-nous à support@solopack.com
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { LogOut, CreditCard, Sparkles, Clock } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface BetaEndBlockerProps {
  betaEndDate: Date | null
  isWithin30Days: boolean
}

export function BetaEndBlocker({ betaEndDate, isWithin30Days }: BetaEndBlockerProps) {
  const handleSubscribe = () => {
    // Utiliser window.location pour forcer un rechargement complet
    window.location.href = '/pricing'
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  // Calculer la date limite (30 jours après la fin du beta)
  const deadlineDate = betaEndDate
    ? new Date(new Date(betaEndDate).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-lg shadow-xl p-8 space-y-6 text-center">
          {/* Icon */}
          <div className={`mx-auto w-16 h-16 ${isWithin30Days ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10' : 'bg-primary/10'} rounded-full flex items-center justify-center`}>
            {isWithin30Days ? (
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            ) : (
              <CreditCard className="h-8 w-8 text-primary" />
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {isWithin30Days ? "Merci d'avoir testé SoloPack !" : "Abonnement requis"}
            </h1>
            <p className="text-muted-foreground">
              {isWithin30Days ? (
                <>
                  La période bêta est maintenant terminée. En tant que beta testeur, profitez d&apos;une offre exclusive : <span className="font-bold text-blue-600 dark:text-blue-400">50% de réduction à vie</span> si vous vous abonnez avant le {deadlineDate ? formatDate(deadlineDate) : ''} !
                </>
              ) : (
                "Pour continuer à utiliser SoloPack, vous devez souscrire à un abonnement."
              )}
            </p>
          </div>

          {/* Benefits */}
          <div className={`${isWithin30Days ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-muted/50'} rounded-lg p-4 text-left`}>
            <p className="text-sm font-medium mb-2">En vous abonnant, vous bénéficiez de :</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Accès illimité à toutes les fonctionnalités</li>
              {isWithin30Days && (
                <li className="font-bold text-blue-600 dark:text-blue-400">• 14.50$/mois au lieu de 29$/mois - À VIE !</li>
              )}
              <li>• Support prioritaire</li>
              <li>• Mises à jour régulières</li>
            </ul>
          </div>

          {/* Warning pour beta testers */}
          {isWithin30Days && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
              <div className="flex gap-2 items-start">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-semibold mb-1">⚠️ Important</p>
                  <p>
                    Cette réduction de 50% est garantie à vie tant que vous restez abonné.
                    Si vous annulez votre abonnement, vous perdrez ce tarif privilégié.
                    L&apos;offre expire le {deadlineDate ? formatDate(deadlineDate) : ''}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleSubscribe}
              size="lg"
              className={`w-full ${isWithin30Days ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
            >
              {isWithin30Days ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Profiter de l&apos;offre exclusive
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  S&apos;abonner maintenant
                </>
              )}
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

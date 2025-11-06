import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default async function PricingSuccessPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Bienvenue dans SoloPack Pro !</h1>

        <p className="text-muted-foreground mb-6">
          Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les
          fonctionnalités de SoloPack Pro.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Prochaine étape :</strong> Pour tirer le maximum de SoloPack, nous vous recommandons de compléter votre profil avec vos informations d&apos;entreprise (nom, adresse, numéros de taxes, logo, etc.). Cela vous permettra de générer des factures professionnelles dès maintenant.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/profil">
            <Button size="lg" className="w-full">
              Compléter mon profil
            </Button>
          </Link>

          <Link href="/">
            <Button size="lg" variant="outline" className="w-full">
              Accéder au tableau de bord
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Vous recevrez un email de confirmation avec les détails de votre abonnement.
        </p>
      </div>
    </div>
  )
}

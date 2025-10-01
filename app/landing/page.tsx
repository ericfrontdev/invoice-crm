import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-8">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Gestion simplifiée de facturation
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-900 dark:from-slate-100 dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Facturez en toute simplicité
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Gérez vos clients, suivez vos paiements et créez des factures professionnelles en quelques clics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Se connecter
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Aucune carte bancaire requise • Configuration en 2 minutes
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète pour gérer votre activité de facturation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:border-blue-500">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 grid place-items-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestion de clients</h3>
              <p className="text-muted-foreground">
                Centralisez toutes les informations de vos clients et suivez leur historique en un seul endroit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:border-purple-500">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 grid place-items-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Factures professionnelles</h3>
              <p className="text-muted-foreground">
                Créez et envoyez des factures professionnelles par email en quelques secondes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:border-green-500">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 grid place-items-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Suivi des paiements</h3>
              <p className="text-muted-foreground">
                Gardez un œil sur vos montants dus et recevez des alertes pour les paiements en retard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:border-amber-500">
              <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 grid place-items-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tableau de bord</h3>
              <p className="text-muted-foreground">
                Visualisez vos statistiques en temps réel et prenez des décisions éclairées.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:border-red-500">
              <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 grid place-items-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-tenant sécurisé</h3>
              <p className="text-muted-foreground">
                Vos données sont isolées et protégées. Chaque utilisateur accède uniquement à ses informations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 hover:border-cyan-500">
              <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 grid place-items-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Envoi automatique</h3>
              <p className="text-muted-foreground">
                Envoyez vos factures directement par email avec un design professionnel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Tarification simple et transparente
              </h2>
              <p className="text-xl text-muted-foreground">
                Commencez gratuitement, évoluez à votre rythme
              </p>
            </div>

            <div className="bg-card rounded-2xl border shadow-xl p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-4">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Bêta gratuite
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-2">Gratuit pendant la bêta</h3>
                <p className="text-muted-foreground">
                  Accès complet à toutes les fonctionnalités
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Clients illimités',
                  'Factures illimités',
                  'Envoi par email',
                  'Tableau de bord complet',
                  'Support par email',
                  'Mises à jour régulières',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 grid place-items-center flex-shrink-0">
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/auth/register" className="block">
                <Button size="lg" className="w-full text-lg py-6">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à simplifier votre facturation ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Rejoignez les entrepreneurs qui font confiance à notre plateforme pour gérer leur facturation.
          </p>
          <Link href="/auth/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 bg-white hover:bg-slate-100 text-slate-900"
            >
              Créer mon compte gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">© 2025 Invoice Manager. Tous droits réservés.</p>
            <div className="flex justify-center gap-6 text-sm">
              <Link href="#" className="hover:text-foreground transition-colors">
                Confidentialité
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Conditions
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

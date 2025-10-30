import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { Navigation } from '@/components/navigation'
import { FeedbackWidget } from '@/components/feedback-widget'
import { BetaEndBlocker } from '@/components/beta-end-blocker'
import { auth } from '@/auth'
import { isSuperAdmin } from '@/lib/check-super-admin'
import { prisma } from '@/lib/prisma'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SoloPack',
  description: 'Pack d\'outils complet pour solopreneurs québécois',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const isAdmin = session?.user?.id ? await isSuperAdmin(session.user.id) : false

  // Vérifier si la période bêta est terminée
  let isBetaEnded = false
  if (session?.user?.id && !isAdmin) {
    try {
      // Récupérer ou créer les paramètres système
      let settings = await prisma.systemSettings.findFirst()
      if (!settings) {
        settings = await prisma.systemSettings.create({
          data: {
            feedbackSystemEnabled: true,
            betaEndDate: null,
          },
        })
      }
      if (settings?.betaEndDate) {
        const now = new Date()
        const endDate = new Date(settings.betaEndDate)

      // Si la date de fin est passée
      if (now > endDate) {
        // Vérifier si l'utilisateur a un plan payant
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { plan: true }
        })

        // Bloquer si pas de plan ou plan gratuit
        if (!user?.plan || user.plan === 'free') {
          isBetaEnded = true
        }
      }
      }
    } catch (error) {
      console.error('Error checking beta status:', error)
      // En cas d'erreur, on continue sans bloquer l'utilisateur
    }
  }

  return (
    <html
      lang="fr"
      suppressHydrationWarning={true}
    >
      <body className={inter.className}>
        <ThemeProvider>
          {isBetaEnded ? (
            <BetaEndBlocker />
          ) : (
            <>
              <Navigation user={session?.user} isSuperAdmin={isAdmin} />
              <main className="min-h-screen bg-background">{children}</main>
              {session?.user && <FeedbackWidget />}
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}

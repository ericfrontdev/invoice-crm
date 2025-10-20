import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { Navigation } from '@/components/navigation'
import { auth } from '@/auth'
import { isSuperAdmin } from '@/lib/check-super-admin'

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

  return (
    <html
      lang="fr"
      suppressHydrationWarning={true}
    >
      <body className={inter.className}>
        <ThemeProvider>
          <Navigation user={session?.user} isSuperAdmin={isAdmin} />
          <main className="min-h-screen bg-background">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

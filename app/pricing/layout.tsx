import { Navigation } from '@/components/navigation'
import { auth } from '@/auth'
import { isSuperAdmin } from '@/lib/check-super-admin'

export default async function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const isAdmin = session?.user?.id ? await isSuperAdmin(session.user.id) : false

  return (
    <>
      <Navigation user={session?.user} isSuperAdmin={isAdmin} />
      <main className="min-h-screen bg-background">{children}</main>
    </>
  )
}

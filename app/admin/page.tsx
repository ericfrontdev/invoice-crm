import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/check-super-admin'
import { AlertCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

async function getAdminData() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      address: true,
      plan: true,
      paymentMethod: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Check which users are super admins
  const superAdmins = await prisma.superAdmin.findMany({
    select: { userId: true },
  })
  const superAdminIds = new Set(superAdmins.map((sa) => sa.userId))

  return users.map((user) => ({
    ...user,
    isSuperAdmin: superAdminIds.has(user.id),
  }))
}

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const isAdmin = await isSuperAdmin(session.user.id)

  if (!isAdmin) {
    redirect('/')
  }

  const users = await getAdminData()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
          <p className="text-muted-foreground">
            Informations des utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/feedback">
            <Button variant="outline">
              Feedback
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </Link>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun utilisateur pour l&apos;instant</p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Utilisateurs ({users.length})</h2>
          </div>
          <AdminUsersTable users={users} />
        </div>
      )}
    </div>
  )
}

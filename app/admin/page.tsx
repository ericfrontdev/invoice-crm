import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/check-super-admin'
import { AlertCircle } from 'lucide-react'

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
        <p className="text-muted-foreground">
          Informations des utilisateurs de la plateforme
        </p>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Compagnie</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Téléphone</th>
                  <th className="text-left py-3 px-4">Adresse</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Paiement</th>
                  <th className="text-left py-3 px-4">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center text-white text-xs font-medium">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.isSuperAdmin && (
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border-red-200 dark:bg-red-400/10 dark:text-red-300 dark:border-red-300/20">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.company || '-'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">{user.phone || '-'}</td>
                    <td className="py-3 px-4">{user.address || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        user.plan === 'owner'
                          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-300 dark:from-amber-400/10 dark:to-yellow-400/10 dark:text-amber-300 dark:border-amber-300/20'
                          : user.plan === 'premium'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-300/20'
                          : user.plan === 'pro'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-300/20'
                          : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-400/10 dark:text-gray-300 dark:border-gray-300/20'
                      }`}>
                        {user.plan || 'free'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.paymentMethod || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

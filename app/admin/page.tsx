import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/check-super-admin'
import { Users, DollarSign, FileText, AlertCircle } from 'lucide-react'

async function getAdminData() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      image: true,
      _count: {
        select: {
          clients: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get additional stats for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      const [invoiceCount, totalUnpaid] = await Promise.all([
        prisma.invoice.count({
          where: { client: { userId: user.id } },
        }),
        prisma.unpaidAmount.aggregate({
          where: { client: { userId: user.id }, status: 'unpaid' },
          _sum: { amount: true },
        }),
      ])

      return {
        ...user,
        stats: {
          clientCount: user._count.clients,
          invoiceCount,
          totalUnpaid: totalUnpaid._sum.amount || 0,
        },
      }
    })
  )

  return usersWithStats
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

  const totalUsers = users.length
  const totalClients = users.reduce((acc, u) => acc + u.stats.clientCount, 0)
  const totalInvoices = users.reduce((acc, u) => acc + u.stats.invoiceCount, 0)
  const totalUnpaid = users.reduce((acc, u) => acc + u.stats.totalUnpaid, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
        <p className="text-muted-foreground">
          Gérez les utilisateurs et visualisez les statistiques globales
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 grid place-items-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 grid place-items-center">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clients</p>
              <p className="text-2xl font-bold">{totalClients}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 grid place-items-center">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Factures</p>
              <p className="text-2xl font-bold">{totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 grid place-items-center">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total dû</p>
              <p className="text-2xl font-bold">{totalUnpaid.toFixed(2)} $</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Utilisateurs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4">Utilisateur</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-center py-3 px-4">Clients</th>
                <th className="text-center py-3 px-4">Factures</th>
                <th className="text-right py-3 px-4">Total dû</th>
                <th className="text-left py-3 px-4">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 grid place-items-center text-white text-xs font-medium">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-4 text-center">{user.stats.clientCount}</td>
                  <td className="py-3 px-4 text-center">{user.stats.invoiceCount}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {user.stats.totalUnpaid.toFixed(2)} $
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun utilisateur pour l&apos;instant</p>
        </div>
      )}
    </div>
  )
}

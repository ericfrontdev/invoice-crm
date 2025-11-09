import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/check-super-admin'
import { AdminDashboardPage } from '@/components/pages/admin-dashboard-page'

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

  return <AdminDashboardPage users={users} />
}

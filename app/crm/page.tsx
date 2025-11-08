import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { CRMPageClient } from '@/components/pages/crm-page-client'

async function getClients(userId: string) {
  return await prisma.client.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
    },
  })
}

export default async function CRMPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const clients = await getClients(session.user.id)

  return <CRMPageClient clients={clients} />
}

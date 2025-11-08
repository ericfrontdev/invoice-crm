import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard-client'

async function getDashboardData(userId: string) {
  const now = new Date()

  const [totalDueRes, overdueRes, draftsRes, sentRes, paidRes] =
    await Promise.allSettled([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: 'sent', client: { userId } },
      }),
      prisma.invoice.findMany({
        where: {
          status: 'sent',
          dueDate: { lt: now },
          client: { userId }
        },
        take: 5,
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          number: true,
          total: true,
          dueDate: true,
          client: { select: { id: true, name: true } },
        },
      }),
      prisma.invoice.count({ where: { status: 'draft', client: { userId } } }),
      prisma.invoice.count({ where: { status: 'sent', client: { userId } } }),
      prisma.invoice.count({ where: { status: 'paid', client: { userId } } }),
    ])

  const totalDueAgg =
    totalDueRes.status === 'fulfilled'
      ? totalDueRes.value
      : { _sum: { total: 0 } }
  const overdue = overdueRes.status === 'fulfilled' ? overdueRes.value : []
  const drafts = draftsRes.status === 'fulfilled' ? draftsRes.value : 0
  const sent = sentRes.status === 'fulfilled' ? sentRes.value : 0
  const paid = paidRes.status === 'fulfilled' ? paidRes.value : 0

  const topClientsGroup = await prisma.unpaidAmount.groupBy({
    by: ['clientId'],
    where: { status: 'unpaid', client: { userId } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5,
  })

  const clientIds = topClientsGroup.map((c) => c.clientId)
  const clientInfos = clientIds.length
    ? await prisma.client.findMany({
        where: { id: { in: clientIds }, userId },
        select: { id: true, name: true },
      })
    : []
  const clientNameById = Object.fromEntries(
    clientInfos.map((c) => [c.id, c.name])
  ) as Record<string, string>

  return {
    totalDue: totalDueAgg._sum.total ?? 0,
    overdue,
    counts: { drafts, sent, paid },
    topClients: topClientsGroup.map((c) => ({
      id: c.clientId,
      name: clientNameById[c.clientId] ?? 'Client',
      total: c._sum.amount ?? 0,
    })),
  }
}

export default async function Home() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { totalDue, overdue, counts, topClients } = await getDashboardData(
    session.user.id
  )

  return (
    <DashboardClient
      totalDue={totalDue}
      overdue={overdue}
      counts={counts}
      topClients={topClients}
    />
  )
}

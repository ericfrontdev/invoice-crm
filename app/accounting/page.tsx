import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccountingView } from '@/components/accounting-view'

async function getAccountingData(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  // Revenus du mois (factures payées)
  const [revenueMonthProjects, revenueMonthStandalone] = await Promise.all([
    // Factures projets du mois
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        status: 'paid',
        client: { userId },
        createdAt: { gte: startOfMonth },
        projectId: { not: null },
      },
    }),
    // Factures ponctuelles du mois
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: {
        status: 'paid',
        client: { userId },
        createdAt: { gte: startOfMonth },
        projectId: null,
      },
    }),
  ])

  const revenueMonthTotal = (revenueMonthProjects._sum.total || 0) + (revenueMonthStandalone._sum.total || 0)

  // Revenus de l'année (pour le bilan)
  const revenueYear = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: {
      status: 'paid',
      client: { userId },
      createdAt: { gte: startOfYear },
    },
  })

  // Transactions récentes (factures payées)
  const recentTransactions = await prisma.invoice.findMany({
    where: {
      status: 'paid',
      client: { userId },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      number: true,
      total: true,
      createdAt: true,
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      project: {
        select: {
          name: true,
        },
      },
    },
  })

  // Toutes les factures payées (pour l'onglet revenus)
  const allInvoices = await prisma.invoice.findMany({
    where: {
      status: 'paid',
      client: { userId },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      number: true,
      total: true,
      createdAt: true,
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Revenus manuels
  const manualRevenues = await prisma.revenue.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  // Dépenses
  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  // Revenus par mois (6 derniers mois)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const monthlyRevenue = await prisma.invoice.groupBy({
    by: ['createdAt'],
    where: {
      status: 'paid',
      client: { userId },
      createdAt: { gte: sixMonthsAgo },
    },
    _sum: { total: true },
  })

  // Agréger par mois
  const monthlyRevenueMap = new Map<string, number>()
  monthlyRevenue.forEach((item) => {
    const monthKey = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`
    const current = monthlyRevenueMap.get(monthKey) || 0
    monthlyRevenueMap.set(monthKey, current + (item._sum.total || 0))
  })

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return {
      month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
      amount: monthlyRevenueMap.get(monthKey) || 0,
    }
  })

  return {
    revenue: {
      monthProjects: revenueMonthProjects._sum.total || 0,
      monthStandalone: revenueMonthStandalone._sum.total || 0,
      monthTotal: revenueMonthTotal,
      year: revenueYear._sum.total || 0,
    },
    recentTransactions,
    revenueByMonth,
    allInvoices,
    manualRevenues,
    expenses,
  }
}

export default async function AccountingPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const { revenue, recentTransactions, revenueByMonth, allInvoices, manualRevenues, expenses } = await getAccountingData(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comptabilité</h1>
          <p className="text-muted-foreground">
            Vue d&apos;ensemble de vos revenus et transactions
          </p>
        </div>
      </div>

      {/* Vue avec onglets */}
      <AccountingView data={{ revenue, recentTransactions, revenueByMonth, allInvoices, manualRevenues, expenses }} />
    </div>
  )
}

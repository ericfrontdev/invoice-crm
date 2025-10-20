import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const revenues = await prisma.revenue.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(revenues)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { description, amount, date, category } = body

  const revenue = await prisma.revenue.create({
    data: {
      description,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      category: category || null,
      userId: session.user.id,
    },
  })

  return NextResponse.json(revenue)
}

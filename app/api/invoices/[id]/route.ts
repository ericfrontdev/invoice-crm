import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const params = await props.params
  const id = params.id
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  try {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true, company: true, email: true, address: true, userId: true },
          },
          items: {
            select: { id: true, description: true, amount: true, date: true, dueDate: true },
            orderBy: { date: 'asc' },
          },
        },
      })
      if (!invoice) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

      // Verify ownership
      if (invoice.client.userId !== session.user.id) {
        return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
      }

      // If no items stored yet, try deriving from linked unpaid amounts
      if (!invoice.items || invoice.items.length === 0) {
        try {
          const amounts = await prisma.unpaidAmount.findMany({
            where: { invoiceId: id },
            select: { id: true, description: true, amount: true, date: true, dueDate: true },
            orderBy: { date: 'asc' },
          })
          if (amounts.length > 0) {
            return NextResponse.json({ ...invoice, items: amounts })
          }
        } catch {
          // if column doesn't exist, ignore
        }
      }

      return NextResponse.json(invoice)
    } catch {
      // Fallback: older schema without items relation
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true, company: true, email: true, address: true, userId: true },
          },
        },
      })
      if (!invoice) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

      // Verify ownership in fallback
      if (invoice.client.userId !== session.user.id) {
        return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
      }

      return NextResponse.json(invoice)
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

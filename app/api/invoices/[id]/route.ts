import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  const id = params.id
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  try {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: {
            select: { id: true, name: true, company: true, email: true, address: true },
          },
          items: {
            select: { id: true, description: true, amount: true, date: true, dueDate: true },
            orderBy: { date: 'asc' },
          },
        },
      })
      if (!invoice) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

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
            select: { id: true, name: true, company: true, email: true, address: true },
          },
        },
      })
      if (!invoice) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
      return NextResponse.json(invoice)
    }
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

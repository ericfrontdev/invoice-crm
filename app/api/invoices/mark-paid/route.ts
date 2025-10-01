import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    const body = await req.json()
    const invoiceId: string | undefined = body?.invoiceId
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId requis' }, { status: 400 })
    }

    // Verify ownership before updating
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          select: { userId: true }
        }
      }
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    if (existingInvoice.client.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'paid' },
    })

    return NextResponse.json({ ok: true, invoice }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Impossible de marquer la facture comme payée" }, { status: 500 })
  }
}


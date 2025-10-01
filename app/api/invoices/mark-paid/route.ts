import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const invoiceId: string | undefined = body?.invoiceId
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId requis' }, { status: 400 })
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


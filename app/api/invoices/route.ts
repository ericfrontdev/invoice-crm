import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function makeInvoiceNumber() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `INV-${ymd}-${rand}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('[invoices:POST] Request body:', body)
    const clientId: string | undefined = body?.clientId
    const unpaidAmountIds: string[] | undefined = body?.unpaidAmountIds

    if (!clientId || !Array.isArray(unpaidAmountIds) || unpaidAmountIds.length === 0) {
      console.log('[invoices:POST] Validation failed:', { clientId, unpaidAmountIds })
      return NextResponse.json({ error: 'clientId et unpaidAmountIds requis.' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Vérifier client
      const client = await tx.client.findUnique({ where: { id: clientId } })
      if (!client) {
        throw new Error('CLIENT_NOT_FOUND')
      }

      // Récupérer montants encore "unpaid" pour ce client et ces IDs
      const items = await tx.unpaidAmount.findMany({
        where: {
          id: { in: unpaidAmountIds },
          clientId,
          status: 'unpaid',
        },
        select: { id: true, amount: true, description: true, date: true, dueDate: true },
      })

      if (items.length === 0) {
        console.log('[invoices:POST] No valid items found')
        throw new Error('NO_ITEMS')
      }

      console.log('[invoices:POST] Creating invoice with', items.length, 'items')
      const total = items.reduce((s, it) => s + it.amount, 0)
      const number = makeInvoiceNumber()

      const invoice = await tx.invoice.create({
        data: {
          clientId,
          number,
          status: 'draft',
          total,
        },
      })
      console.log('[invoices:POST] Invoice created:', invoice.id, invoice.number)

      // Snapshot des lignes de facture
      if (items.length > 0) {
        await tx.invoiceItem.createMany({
          data: items.map((it) => ({
            invoiceId: invoice.id,
            description: it.description,
            amount: it.amount,
            date: it.date,
            dueDate: it.dueDate ?? null,
          })),
        })
      }

      // Lier les UnpaidAmount à la facture si la colonne existe, sinon fallback
      try {
        await tx.unpaidAmount.updateMany({
          where: { id: { in: items.map((i) => i.id) } },
          data: { status: 'invoiced', invoiceId: invoice.id },
        })
      } catch (e) {
        console.warn('[invoices:POST] unpaidAmount.invoiceId link skipped (likely missing column):', e)
        await tx.unpaidAmount.updateMany({
          where: { id: { in: items.map((i) => i.id) } },
          data: { status: 'invoiced' },
        })
      }

      return invoice
    })

    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    if (err?.message === 'CLIENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Client introuvable.' }, { status: 404 })
    }
    if (err?.message === 'NO_ITEMS') {
      return NextResponse.json({ error: 'Aucun montant sélectionné valide.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur lors de la création de la facture.' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const body = await req.json()
    const { amount, description, date, dueDate } = body

    if (!amount || !description || !date) {
      return NextResponse.json(
        { error: 'Montant, description et date requis' },
        { status: 400 }
      )
    }

    const unpaidAmount = await prisma.unpaidAmount.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return NextResponse.json(unpaidAmount, { status: 200 })
  } catch (e) {
    console.error('[unpaid-amounts:PATCH] Error:', e)
    return NextResponse.json(
      { error: 'Erreur lors de la modification du montant' },
      { status: 500 }
    )
  }
}

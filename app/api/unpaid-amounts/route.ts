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
    const { clientId, amount, dueDate, date } = body ?? {}
    let { description } = body ?? {}

    description = typeof description === 'string' ? description.trim() : ''

    if (!clientId || !description || amount == null || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 })
    }

    // Vérifie que le client existe et appartient à l'utilisateur
    const client = await prisma.client.findUnique({
      where: {
        id: String(clientId),
        userId: session.user.id
      }
    })
    if (!client) {
      return NextResponse.json({ error: 'Client introuvable.' }, { status: 404 })
    }

    // Dates
    const dateObj = date ? new Date(date) : new Date()
    const dueObj = dueDate ? new Date(dueDate) : null
    if (dueObj && dateObj && dueObj < dateObj) {
      return NextResponse.json(
        { error: "La date d'échéance doit être après la date." },
        { status: 400 },
      )
    }

    const row = await prisma.unpaidAmount.create({
      data: {
        clientId: String(clientId),
        amount: Number(amount),
        description: description,
        date: dateObj,
        dueDate: dueObj,
        status: 'unpaid',
      },
    })

    return NextResponse.json(row, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'ajout du montant." },
      { status: 500 },
    )
  }
}

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
    const { name, company, email, phone, address, website } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nom et email requis' },
        { status: 400 }
      )
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        company: company || null,
        email,
        phone: phone || null,
        address: address || null,
        website: website || null,
      },
    })

    return NextResponse.json(client, { status: 200 })
  } catch (e) {
    console.error('[clients:PATCH] Error:', e)
    return NextResponse.json(
      { error: 'Erreur lors de la modification du client' },
      { status: 500 }
    )
  }
}

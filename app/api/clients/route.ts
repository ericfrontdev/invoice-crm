import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let { name, company, email, phone, address, website } = body ?? {}

    name = typeof name === 'string' ? name.trim() : ''
    email = typeof email === 'string' ? email.trim() : ''
    company = typeof company === 'string' ? company.trim() : null
    phone = typeof phone === 'string' ? phone.trim() : null
    address = typeof address === 'string' ? address.trim() : null
    website = typeof website === 'string' ? website.trim() : null

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Les champs name et email sont requis.' },
        { status: 400 },
      )
    }

    const emailOk = /.+@.+\..+/.test(email)
    if (!emailOk) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    // Récupère un user pour lier le client (pas d’auth pour l’instant)
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'demo@example.com', name: 'Demo User' },
      })
    }

    const client = await prisma.client.create({
      data: {
        name,
        company: company || null,
        email,
        phone: phone || null,
        address: address || null,
        website: website || null,
        userId: user.id,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la création du client.' },
      { status: 500 },
    )
  }
}

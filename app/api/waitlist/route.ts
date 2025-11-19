import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'waitlist.allFieldsRequired' },
        { status: 400 }
      )
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'waitlist.invalidEmail' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà dans la waitlist
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { email },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'waitlist.alreadyOnWaitlist' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur n'est pas déjà inscrit
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'waitlist.alreadyRegistered' },
        { status: 400 }
      )
    }

    // Ajouter à la waitlist
    const entry = await prisma.waitlistEntry.create({
      data: {
        name,
        email,
      },
    })

    return NextResponse.json(
      { message: 'waitlist.successfullyAdded', id: entry.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    return NextResponse.json(
      { error: 'waitlist.errorAdding' },
      { status: 500 }
    )
  }
}

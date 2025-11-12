import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { name, email, password, invitationCode } = await req.json()

    if (!name || !email || !password || !invitationCode) {
      return NextResponse.json(
        { error: 'auth.allFieldsRequired' },
        { status: 400 }
      )
    }

    // Vérifier le code d'invitation
    const code = await prisma.invitationCode.findUnique({
      where: { code: invitationCode.toUpperCase() }
    })

    if (!code) {
      return NextResponse.json(
        { error: 'auth.invalidInvitationCode' },
        { status: 400 }
      )
    }

    if (!code.active) {
      return NextResponse.json(
        { error: 'auth.invitationCodeDeactivated' },
        { status: 400 }
      )
    }

    if (code.usedBy) {
      return NextResponse.json(
        { error: 'auth.invitationCodeAlreadyUsed' },
        { status: 400 }
      )
    }

    if (code.expiresAt && new Date() > code.expiresAt) {
      return NextResponse.json(
        { error: 'auth.invitationCodeExpired' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'auth.userAlreadyExists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (tous les utilisateurs avec code d'invitation sont beta testers)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        betaTester: true,
        lifetimeDiscount: 50, // 50% de réduction à vie pour les beta testers
      },
    })

    // Marquer le code comme utilisé
    await prisma.invitationCode.update({
      where: { id: code.id },
      data: {
        usedBy: user.id,
        usedAt: new Date(),
        uses: code.uses + 1
      }
    })

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'auth.userCreationError' },
      { status: 500 }
    )
  }
}

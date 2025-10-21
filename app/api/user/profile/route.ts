import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      email,
      company,
      phone,
      address,
      neq,
      tpsNumber,
      tvqNumber,
      chargesTaxes,
      paymentProvider,
      paypalEmail,
      stripeAccountId
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Le nom et l\'email sont requis' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        company: company || null,
        phone: phone || null,
        address: address || null,
        neq: neq || null,
        tpsNumber: tpsNumber || null,
        tvqNumber: tvqNumber || null,
        chargesTaxes: chargesTaxes ?? false,
        paymentProvider: paymentProvider || null,
        paypalEmail: paypalEmail || null,
        stripeAccountId: stripeAccountId || null,
      },
    })

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        phone: updatedUser.phone,
        address: updatedUser.address,
        neq: updatedUser.neq,
        tpsNumber: updatedUser.tpsNumber,
        tvqNumber: updatedUser.tvqNumber,
        chargesTaxes: updatedUser.chargesTaxes,
        paymentProvider: updatedUser.paymentProvider,
        paypalEmail: updatedUser.paypalEmail,
        stripeAccountId: updatedUser.stripeAccountId,
      },
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const params = await props.params
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

    // Verify ownership
    const existingClient = await prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingClient || existingClient.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Client introuvable' },
        { status: 404 }
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

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const params = await props.params
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get('permanent') === 'true'

    // Verify ownership
    const existingClient = await prisma.client.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existingClient || existingClient.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Client introuvable' },
        { status: 404 }
      )
    }

    if (permanent) {
      // Permanent deletion - only for archived clients
      await prisma.client.delete({
        where: { id },
      })
      return NextResponse.json({ success: true, message: 'Client supprimé définitivement' }, { status: 200 })
    } else {
      // Archive the client instead of deleting
      await prisma.client.update({
        where: { id },
        data: {
          archived: true,
          archivedAt: new Date(),
        },
      })
      return NextResponse.json({ success: true, message: 'Client archivé' }, { status: 200 })
    }
  } catch (e) {
    console.error('[clients:DELETE] Error:', e)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    )
  }
}

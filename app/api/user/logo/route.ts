import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 })
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier est trop volumineux (max 5MB)' }, { status: 400 })
    }

    // Créer le dossier uploads/logos s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'logos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Générer un nom unique pour le fichier
    const fileName = `${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`
    const filePath = join(uploadDir, fileName)

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL publique du logo
    const logoUrl = `/uploads/logos/${fileName}`

    // Mettre à jour l'utilisateur avec l'URL du logo
    await prisma.user.update({
      where: { id: session.user.id },
      data: { logo: logoUrl },
    })

    return NextResponse.json({ logoUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload du logo' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Supprimer le logo de la base de données
    await prisma.user.update({
      where: { id: session.user.id },
      data: { logo: null },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting logo:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du logo' }, { status: 500 })
  }
}

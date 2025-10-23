import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const params = await props.params

  // Vérifier que le projet appartient à un client de l'utilisateur
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      client: { userId: session.user.id },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 })
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier est trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Créer le dossier d'uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'projects', params.id)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = join(uploadsDir, filename)

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Créer l'entrée dans la base de données
    const projectFile = await prisma.projectFile.create({
      data: {
        filename: file.name,
        fileUrl: `/uploads/projects/${params.id}/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
        projectId: params.id,
      },
    })

    return NextResponse.json(projectFile, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({
      error: 'Erreur lors de l\'upload du fichier',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const params = await props.params

  // Vérifier que le projet appartient à un client de l'utilisateur
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      client: { userId: session.user.id },
    },
  })

  if (!project) {
    return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
  }

  const files = await prisma.projectFile.findMany({
    where: { projectId: params.id },
    orderBy: { uploadedAt: 'desc' },
  })

  return NextResponse.json(files)
}

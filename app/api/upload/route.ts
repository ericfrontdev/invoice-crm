import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/upload - Upload image to Cloudinary
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary
    const result = await new Promise<{secure_url: string; public_id: string}>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'solopack-feedback',
          resource_type: 'auto',
          // Optimisations automatiques
          transformation: [
            { width: 1920, crop: 'limit' }, // Max 1920px de large
            { quality: 'auto' }, // Compression auto
            { fetch_format: 'auto' }, // Format optimal (WebP si supporté)
          ],
        },
        (error, uploadResult) => {
          if (error) reject(error)
          else resolve(uploadResult as {secure_url: string; public_id: string})
        }
      ).end(buffer)
    })

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    )
  }
}

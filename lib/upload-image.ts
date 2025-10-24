/**
 * Helper pour uploader une image vers Cloudinary via notre API
 */

export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Erreur lors de l\'upload')
  }

  return response.json()
}

/**
 * Valider qu'un fichier est une image et pas trop lourd
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check type
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Le fichier doit être une image (PNG, JPG, WebP, etc.)'
    }
  }

  // Check size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'L\'image ne doit pas dépasser 10MB'
    }
  }

  return { valid: true }
}

/**
 * Hook React pour gérer l'upload avec loading state
 */
export function useImageUpload() {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const upload = async (file: File): Promise<{ url: string; publicId: string } | null> => {
    setUploading(true)
    setError(null)

    try {
      // Valider
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error!)
        return null
      }

      // Upload
      const result = await uploadImage(file)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'upload'
      setError(message)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}

// Need to import React for the hook
import React from 'react'

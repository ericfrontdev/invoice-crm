import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const correctUserId = 'cmg8cduht0000ie0auxraeye5' // ouellette.eric@gmail.com

  // Vérifier l'utilisateur
  const user = await prisma.user.findUnique({
    where: { id: correctUserId },
  })

  if (!user) {
    console.error('Utilisateur introuvable')
    return
  }

  console.log(`Mise à jour SuperAdmin pour: ${user.email}`)

  // Supprimer toutes les anciennes entrées SuperAdmin
  await prisma.superAdmin.deleteMany({})
  console.log('✅ Anciennes entrées SuperAdmin supprimées')

  // Créer la nouvelle entrée
  const superAdmin = await prisma.superAdmin.create({
    data: {
      userId: correctUserId,
    },
  })

  console.log(`✅ SuperAdmin créé pour ${user.email}`)
  console.log(`ID: ${superAdmin.id}`)
}

main()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

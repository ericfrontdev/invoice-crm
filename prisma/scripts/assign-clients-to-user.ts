import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer le premier utilisateur (vous)
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (!firstUser) {
    console.log('Aucun utilisateur trouvé. Créez d\'abord un compte.')
    return
  }

  console.log(`Utilisateur trouvé: ${firstUser.email} (${firstUser.id})`)

  // Trouver tous les clients sans userId
  const clientsWithoutUser = await prisma.client.findMany({
    where: {
      userId: null,
    },
  })

  console.log(`Clients sans userId: ${clientsWithoutUser.length}`)

  if (clientsWithoutUser.length === 0) {
    console.log('Tous les clients ont déjà un userId.')
    return
  }

  // Assigner tous les clients au premier utilisateur
  const result = await prisma.client.updateMany({
    where: {
      userId: null,
    },
    data: {
      userId: firstUser.id,
    },
  })

  console.log(`✅ ${result.count} clients ont été assignés à ${firstUser.email}`)
}

main()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

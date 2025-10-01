import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const oldUserId = 'cmfnvqpxn0000qp8sb05h1qhy' // eric@ericouellette.com
  const newUserId = 'cmg8cduht0000ie0auxraeye5' // ouellette.eric@gmail.com

  // Vérifier les deux utilisateurs
  const [oldUser, newUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: oldUserId } }),
    prisma.user.findUnique({ where: { id: newUserId } }),
  ])

  if (!oldUser || !newUser) {
    console.error('Utilisateur introuvable')
    return
  }

  console.log(`Transfert de: ${oldUser.email}`)
  console.log(`Vers: ${newUser.email}`)
  console.log()

  // Compter les clients à transférer
  const clientCount = await prisma.client.count({
    where: { userId: oldUserId },
  })

  console.log(`${clientCount} clients à transférer...`)

  // Transférer les clients
  const result = await prisma.client.updateMany({
    where: { userId: oldUserId },
    data: { userId: newUserId },
  })

  console.log(`✅ ${result.count} clients transférés avec succès!`)

  // Vérifier
  const newCount = await prisma.client.count({
    where: { userId: newUserId },
  })

  console.log(`${newUser.email} a maintenant ${newCount} clients`)
}

main()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

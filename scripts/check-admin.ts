import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer tous les utilisateurs
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    }
  })

  console.log('👥 Utilisateurs:', users)

  // Récupérer tous les superadmins
  const superAdmins = await prisma.superAdmin.findMany({
    select: {
      id: true,
      userId: true,
      createdAt: true,
    }
  })

  console.log('\n👑 SuperAdmins:', superAdmins)

  // Afficher qui est admin
  console.log('\n📋 Liste complète:')
  for (const user of users) {
    const isAdmin = superAdmins.some(sa => sa.userId === user.id)
    console.log(`  ${isAdmin ? '👑' : '👤'} ${user.name || 'Sans nom'} (${user.email}) - ${isAdmin ? 'ADMIN' : 'Utilisateur normal'}`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'ouellette.eric@gmail.com'

  // Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log('❌ Utilisateur non trouvé')
    return
  }

  // Vérifier s'il est déjà admin
  const existingAdmin = await prisma.superAdmin.findUnique({
    where: { userId: user.id }
  })

  if (existingAdmin) {
    console.log('✅ Déjà admin!')
    return
  }

  // Créer le superadmin
  await prisma.superAdmin.create({
    data: {
      userId: user.id
    }
  })

  console.log(`✅ ${user.name} (${user.email}) est maintenant SUPERADMIN!`)
  console.log('   Vous avez maintenant accès à /admin')
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

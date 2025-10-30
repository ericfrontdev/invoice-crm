import { prisma } from '../lib/prisma'

async function main() {
  const user = await prisma.user.findFirst({
    where: {
      name: {
        contains: 'Paul Bates',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      createdAt: true,
    }
  })

  if (user) {
    console.log('✅ Utilisateur trouvé:')
    console.log('- ID:', user.id)
    console.log('- Nom:', user.name)
    console.log('- Email:', user.email)
    console.log('- Password hash:', user.password ? 'Présent' : 'MANQUANT')
    console.log('- Créé le:', user.createdAt)
  } else {
    console.log('❌ Utilisateur "Paul Bates" non trouvé')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tous les utilisateurs
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          clients: true,
        },
      },
    },
  })

  console.log('\n=== UTILISATEURS ===')
  users.forEach((user) => {
    console.log(`${user.name} (${user.email})`)
    console.log(`  ID: ${user.id}`)
    console.log(`  Clients: ${user._count.clients}`)
    console.log(`  Créé le: ${user.createdAt}`)
    console.log()
  })

  // Tous les clients
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      userId: true,
      _count: {
        select: {
          unpaidAmounts: true,
          invoices: true,
        },
      },
    },
  })

  console.log('=== CLIENTS ===')
  clients.forEach((client) => {
    console.log(`${client.name} (${client.email})`)
    console.log(`  ID: ${client.id}`)
    console.log(`  User ID: ${client.userId}`)
    console.log(`  Montants dus: ${client._count.unpaidAmounts}`)
    console.log(`  Factures: ${client._count.invoices}`)
    console.log()
  })

  // Super admins
  const superAdmins = await prisma.superAdmin.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  console.log('=== SUPER ADMINS ===')
  if (superAdmins.length === 0) {
    console.log('Aucun super admin')
  } else {
    superAdmins.forEach((sa) => {
      console.log(`User ID: ${sa.userId}`)
      console.log()
    })
  }
}

main()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

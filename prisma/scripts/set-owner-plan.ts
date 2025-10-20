import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find the super admin
  const superAdmin = await prisma.superAdmin.findFirst()

  if (!superAdmin) {
    console.log('No super admin found')
    return
  }

  // Update the user's plan to "owner"
  const user = await prisma.user.update({
    where: { id: superAdmin.userId },
    data: { plan: 'owner' },
  })

  console.log(`✓ Updated ${user.name}'s plan to "owner"`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

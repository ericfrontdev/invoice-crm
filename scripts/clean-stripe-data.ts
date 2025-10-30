import { prisma } from '../lib/prisma'

async function main() {
  console.log('Nettoyage des anciennes données Stripe...')

  const result = await prisma.user.updateMany({
    data: {
      stripeCustomerId: null,
    },
  })

  console.log(`✅ ${result.count} utilisateur(s) nettoyé(s)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

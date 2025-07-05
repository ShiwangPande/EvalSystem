import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default categories
  const categories = [
    { name: 'Web Development', description: 'Web applications and websites' },
    { name: 'Mobile Development', description: 'Mobile applications for iOS and Android' },
    { name: 'Data Science', description: 'Data analysis and machine learning projects' },
    { name: 'AI & Machine Learning', description: 'Artificial intelligence and ML applications' },
    { name: 'Cybersecurity', description: 'Security-focused projects and tools' },
    { name: 'Other', description: 'Other types of projects' },
  ]

  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name }
    })
    
    if (!existing) {
      await prisma.category.create({
        data: category,
      })
    }
  }

  // Create default criteria
  const criteria = [
    {
      name: 'Technical Implementation',
      description: 'Code architecture, best practices, and technical execution',
      weight: 30,
      maxScore: 10,
      order: 1,
    },
    {
      name: 'Code Quality',
      description: 'Code readability, organization, and maintainability',
      weight: 25,
      maxScore: 10,
      order: 2,
    },
    {
      name: 'Documentation',
      description: 'Quality and completeness of project documentation',
      weight: 20,
      maxScore: 10,
      order: 3,
    },
    {
      name: 'UI/UX Design',
      description: 'User interface design and user experience',
      weight: 15,
      maxScore: 10,
      order: 4,
    },
    {
      name: 'Innovation',
      description: 'Creative solutions and innovative approaches',
      weight: 10,
      maxScore: 10,
      order: 5,
    },
  ]

  for (const criterion of criteria) {
    const existing = await prisma.criteria.findFirst({
      where: { name: criterion.name }
    })
    
    if (!existing) {
      await prisma.criteria.create({
        data: criterion,
      })
    }
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
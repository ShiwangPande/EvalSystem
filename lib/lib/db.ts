import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Utility function to ensure user exists in database
export async function ensureUser(clerkUserId: string, userData?: { email?: string; name?: string }) {
  try {
    // Try to find existing user
    let user = await db.user.findUnique({
      where: { id: clerkUserId }
    })

    // If user doesn't exist, create them
    if (!user) {
      // Check if this user should be an admin (from environment variables)
      const initialAdmins = process.env.INITIAL_ADMIN_IDS?.split(',').map(id => id.trim()) || []
      const isInitialAdmin = initialAdmins.includes(clerkUserId)
      
      user = await db.user.create({
        data: {
          id: clerkUserId,
          email: userData?.email || '',
          name: userData?.name || 'Unknown User',
          role: isInitialAdmin ? 'ADMIN' : 'STUDENT'
        }
      })
    } else {
      // Check if existing user should be promoted to admin
      const initialAdmins = process.env.INITIAL_ADMIN_IDS?.split(',').map(id => id.trim()) || []
      const isInitialAdmin = initialAdmins.includes(clerkUserId)
      
      if (isInitialAdmin && user.role !== 'ADMIN') {
        // Promote existing user to admin
        user = await db.user.update({
          where: { id: clerkUserId },
          data: { role: 'ADMIN' }
        })
        console.log(`Promoted user ${clerkUserId} to ADMIN role`)
      }
    }

    return user
  } catch (error) {
    console.error('Error ensuring user exists:', error)
    throw error
  }
}

// Function to promote a user to admin
export async function promoteToAdmin(clerkUserId: string) {
  try {
    const user = await db.user.update({
      where: { id: clerkUserId },
      data: { role: 'ADMIN' }
    })
    console.log(`Promoted user ${clerkUserId} to ADMIN role`)
    return user
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    throw error
  }
}


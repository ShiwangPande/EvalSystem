import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, ensureUser } from '@/lib/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the target admin user exists
    const targetUserId = 'user_2zSsXcOz5ZAKmZcDBnpVJaiAZ6L'
    
    let user = await db.user.findUnique({
      where: { id: targetUserId }
    })

    if (!user) {
      // Create the user with admin role
      const initialAdmins = process.env.INITIAL_ADMIN_IDS?.split(',').map(id => id.trim()) || []
      const isInitialAdmin = initialAdmins.includes(targetUserId)
      
      user = await db.user.create({
        data: {
          id: targetUserId,
          email: 'admin@example.com',
          name: 'Admin User',
          role: isInitialAdmin ? 'ADMIN' : 'STUDENT'
        }
      })
      
      console.log('✅ Created admin user:', user)
    } else {
      // Check if existing user should be promoted
      const initialAdmins = process.env.INITIAL_ADMIN_IDS?.split(',').map(id => id.trim()) || []
      const isInitialAdmin = initialAdmins.includes(targetUserId)
      
      if (isInitialAdmin && user.role !== 'ADMIN') {
        user = await db.user.update({
          where: { id: targetUserId },
          data: { role: 'ADMIN' }
        })
        console.log('✅ Promoted user to admin:', user)
      }
    }

    // Get all users for debugging
    const allUsers = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({
      message: 'User check completed',
      targetUser: user,
      allUsers: allUsers,
      environment: {
        INITIAL_ADMIN_IDS: process.env.INITIAL_ADMIN_IDS
      }
    })

  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
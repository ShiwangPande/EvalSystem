import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { promoteToAdmin, db } from '@/lib/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 })
    }

    // Check if the current user is an admin or if they're promoting themselves
    const currentUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Allow if user is admin or if they're promoting themselves (for initial setup)
    if (currentUser.role !== 'ADMIN' && userId !== targetUserId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Promote the user
    const promotedUser = await promoteToAdmin(targetUserId)

    return NextResponse.json({ 
      message: 'User promoted to admin successfully',
      user: {
        id: promotedUser.id,
        name: promotedUser.name,
        email: promotedUser.email,
        role: promotedUser.role
      }
    })

  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
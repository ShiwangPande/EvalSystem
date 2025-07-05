import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, ensureUser } from '@/lib/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists
    await ensureUser(userId)

    // Promote user to admin
    const user = await db.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    })

    return NextResponse.json({ 
      message: 'User promoted to admin successfully',
      user 
    }, { status: 200 })
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
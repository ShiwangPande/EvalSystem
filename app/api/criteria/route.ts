import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/lib/db'

// GET - Fetch all criteria
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const criteria = await db.criteria.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(criteria)
  } catch (error) {
    console.error('Error fetching criteria:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new criteria (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, weight, maxScore, order } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const criteria = await db.criteria.create({
      data: {
        name,
        description,
        weight: weight || 1.0,
        maxScore: maxScore || 10,
        order: order || 0
      }
    })

    return NextResponse.json(criteria, { status: 201 })
  } catch (error) {
    console.error('Error creating criteria:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
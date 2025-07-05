import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, ensureUser } from '@/lib/lib/db'

// GET - Fetch all submissions
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Check user role for access control
    const currentUser = await db.user.findUnique({
      where: { id: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let whereClause: any = {}

    // Role-based access control
    if (currentUser.role === 'STUDENT') {
      // Students can only see their own submissions
      whereClause.studentId = userId
    }
    // EVALUATOR and ADMIN can see all submissions (no additional filter needed)

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { student: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const submissions = await db.submission.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        evaluations: {
          include: {
            evaluator: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        files: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new submission
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in database
    await ensureUser(userId)

    const body = await request.json()
    const { title, description, categoryId, fileUrls, fileNames, fileSizes } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const submission = await db.submission.create({
      data: {
        title,
        description,
        categoryId: categoryId && categoryId !== "" ? categoryId : null,
        studentId: userId,
        files: {
          create: fileUrls?.map((url: string, index: number) => ({
            fileUrl: url,
            fileName: fileNames?.[index] || `file-${index + 1}`,
            fileSize: fileSizes?.[index] || 0,
            fileType: url.split('.').pop() || 'unknown'
          })) || []
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        files: true
      }
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
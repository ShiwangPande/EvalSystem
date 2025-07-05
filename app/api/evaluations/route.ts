import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, ensureUser } from '@/lib/lib/db'

// GET - Fetch evaluations for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')

    let whereClause: any = { evaluatorId: userId }
    
    if (submissionId) {
      whereClause.submissionId = submissionId
    }

    const evaluations = await db.evaluation.findMany({
      where: whereClause,
      include: {
        submission: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        criteriaEvaluations: {
          include: {
            criteria: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(evaluations)
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new evaluation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in database and check role
    const user = await ensureUser(userId)
    
    // Only evaluators and admins can create evaluations
    if (user.role !== 'EVALUATOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Evaluator or Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId, criteriaScores, criteriaFeedback, overallFeedback } = body

    if (!submissionId || !criteriaScores || !criteriaFeedback) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if evaluation already exists
    const existingEvaluation = await db.evaluation.findUnique({
      where: {
        submissionId_evaluatorId: {
          submissionId,
          evaluatorId: userId
        }
      },
      include: {
        criteriaEvaluations: true
      }
    })

    // Calculate total score
    const criteria = await db.criteria.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    let totalScore = 0
    let totalWeight = 0

    for (const criterion of criteria) {
      const score = criteriaScores[criterion.id] || 0
      totalScore += (score * criterion.weight)
      totalWeight += criterion.weight
    }

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0

    let evaluation

    if (existingEvaluation) {
      // Update existing evaluation
      // First, delete existing criteria evaluations
      await db.criteriaEvaluation.deleteMany({
        where: { evaluationId: existingEvaluation.id }
      })

      // Update the evaluation
      evaluation = await db.evaluation.update({
        where: { id: existingEvaluation.id },
        data: {
          totalScore: finalScore,
          feedback: overallFeedback,
          isCompleted: true,
          criteriaEvaluations: {
            create: Object.keys(criteriaScores).map(criteriaId => ({
              criteriaId,
              score: criteriaScores[criteriaId] || 0,
              feedback: criteriaFeedback[criteriaId] || ''
            }))
          }
        },
        include: {
          submission: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          criteriaEvaluations: {
            include: {
              criteria: true
            }
          }
        }
      })
    } else {
      // Create new evaluation
      evaluation = await db.evaluation.create({
        data: {
          submissionId,
          evaluatorId: userId,
          totalScore: finalScore,
          feedback: overallFeedback,
          isCompleted: true,
          criteriaEvaluations: {
            create: Object.keys(criteriaScores).map(criteriaId => ({
              criteriaId,
              score: criteriaScores[criteriaId] || 0,
              feedback: criteriaFeedback[criteriaId] || ''
            }))
          }
        },
        include: {
          submission: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          criteriaEvaluations: {
            include: {
              criteria: true
            }
          }
        }
      })
    }

    return NextResponse.json(evaluation, { status: existingEvaluation ? 200 : 201 })
  } catch (error) {
    console.error('Error creating evaluation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
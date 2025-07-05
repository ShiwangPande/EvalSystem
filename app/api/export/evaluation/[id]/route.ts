import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const evaluation = await db.evaluation.findUnique({
      where: { id },
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
        evaluator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        criteriaEvaluations: {
          include: {
            criteria: true
          }
        }
      }
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    // Generate PDF content (simplified for now - in production, use a proper PDF library)
    const pdfContent = `
      Evaluation Report
      ================
      
      Submission: ${evaluation.submission.title}
      Student: ${evaluation.submission.student.name}
      Evaluator: ${evaluation.evaluator.name}
      Date: ${evaluation.createdAt.toLocaleDateString()}
      Total Score: ${evaluation.totalScore?.toFixed(2)}/10
      
      Criteria Evaluations:
      ${evaluation.criteriaEvaluations.map(ce => `
        ${ce.criteria.name}:
        - Score: ${ce.score}/${ce.criteria.maxScore}
        - Weight: ${ce.criteria.weight}
        - Feedback: ${ce.feedback || 'No feedback provided'}
      `).join('\n')}
      
      Overall Feedback:
      ${evaluation.feedback || 'No overall feedback provided'}
    `

    // Return as text for now (in production, generate actual PDF)
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="evaluation-${id}.txt"`
      }
    })
  } catch (error) {
    console.error('Error generating evaluation report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 
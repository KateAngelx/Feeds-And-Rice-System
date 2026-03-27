import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET credit records by customer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
        { status: 400 }
      )
    }

    const records = await prisma.creditRecord.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Get credit records error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create credit record
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    if (!data.customerId || !data.amount || !data.type || !data.recordedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const record = await prisma.creditRecord.create({
      data: {
        customerId: data.customerId,
        customerName: data.customerName,
        transactionId: data.transactionId,
        amount: data.amount,
        type: data.type, // 'credit' or 'payment'
        notes: data.notes,
        recordedBy: data.recordedBy,
      },
    })

    // Update customer credit balance
    const amount = data.type === 'payment' ? -data.amount : data.amount
    await prisma.customer.update({
      where: { id: data.customerId },
      data: {
        creditBalance: {
          increment: amount,
        },
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Create credit record error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

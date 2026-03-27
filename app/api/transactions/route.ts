import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all transactions
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        customer: true,
        cashier: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new transaction
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validation
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Transaction must have at least one item' },
        { status: 400 }
      )
    }

    if (!data.cashierId) {
      return NextResponse.json(
        { error: 'Cashier ID is required' },
        { status: 400 }
      )
    }

    // Create transaction with items in a single transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const newTransaction = await tx.transaction.create({
        data: {
          subtotal: Math.round(Number(data.subtotal)) || 0,
          discount: Math.round(Number(data.discount)) || 0,
          total: Math.round(Number(data.total)) || 0,
          paymentMethod: data.paymentMethod || 'cash',
          amountPaid: Math.round(Number(data.amountPaid)) || 0,
          change: Math.round(Number(data.change)) || 0,
          customerId: data.customerId || null,
          customerName: data.customerName || null,
          cashierId: data.cashierId,
          cashierName: data.cashierName || '',
          items: {
            create: data.items.map((item: {
              productId: string
              productName: string
              quantity: number
              unit: string
              price: number
              priceType: string
              subtotal: number
            }) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: Math.round(Number(item.quantity)),
              unit: item.unit,
              price: Math.round(Number(item.price)),
              priceType: item.priceType,
              subtotal: Math.round(Number(item.subtotal)),
            })),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      })

      // Deduct stock from products
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: Math.round(Number(item.quantity)),
            },
          },
        })
      }

      // If credit sale, create credit record and update customer balance
      if (data.paymentMethod === 'credit' && data.customerId) {
        await tx.creditRecord.create({
          data: {
            customerId: data.customerId,
            customerName: data.customerName || '',
            transactionId: newTransaction.id,
            amount: Math.round(Number(data.total)),
            type: 'credit',
            notes: `Transaction #${newTransaction.id.substring(0, 8)}`,
            recordedBy: data.cashierId,
          },
        })

        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            creditBalance: {
              increment: Math.round(Number(data.total)),
            },
          },
        })
      }

      return newTransaction
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

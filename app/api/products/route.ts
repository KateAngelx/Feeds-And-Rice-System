import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // 1. Validation
    if (!data.name || !data.category || !data.createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, or createdBy' },
        { status: 400 }
      )
    }

    // 2. Explicit conversion to Int for Prisma/PostgreSQL
    const product = await prisma.product.create({
      data: {
        name: String(data.name),
        category: String(data.category),
        retailPrice: Math.round(Number(data.retailPrice)) || 0,
        wholesalePrice: Math.round(Number(data.wholesalePrice)) || 0,
        capitalPrice: Math.round(Number(data.capitalPrice)) || 0,
        stock: Math.round(Number(data.stock)) || 0,
        unit: String(data.unit || 'piece'),
        lowStockThreshold: Math.round(Number(data.lowStockThreshold)) || 5,
        isApproved: Boolean(data.isApproved),
        createdBy: String(data.createdBy), // MUST match a real User ID in your DB
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('DATABASE REJECTION:', error.message)
    return NextResponse.json(
      { error: `Database Error: ${error.message}. Ensure the User ID exists in the database.` },
      { status: 500 }
    )
  }
}
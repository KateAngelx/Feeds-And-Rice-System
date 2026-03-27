import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const products = await prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new product
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validation
    if (!data.name || !data.category || !data.createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, or createdBy' },
        { status: 400 }
      )
    }

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
        createdBy: String(data.createdBy),
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

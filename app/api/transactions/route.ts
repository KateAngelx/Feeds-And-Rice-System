import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const where = category ? { category } : {}

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    // Validation: Ensure the basics exist
    if (!data.name || !data.category || !data.createdBy) {
      return NextResponse.json({ error: 'Missing Name, Category, or User ID' }, { status: 400 })
    }

    // CREATE in Database with explicit type casting
    const product = await prisma.product.create({
      data: {
        name: String(data.name),
        category: String(data.category),
        retailPrice: Number(data.retailPrice) || 0,
        wholesalePrice: Number(data.wholesalePrice) || 0,
        capitalPrice: Number(data.capitalPrice) || 0,
        stock: Number(data.stock) || 0,
        unit: String(data.unit || 'piece'),
        lowStockThreshold: Number(data.lowStockThreshold) || 5,
        isApproved: Boolean(data.isApproved), // This comes from our Page logic
        createdBy: String(data.createdBy),
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    // This will print the EXACT reason it failed in your VS Code terminal
    console.error('DATABASE SAVE ERROR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
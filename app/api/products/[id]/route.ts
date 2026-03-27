import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: String(data.name) }),
        ...(data.category && { category: String(data.category) }),
        ...(data.retailPrice !== undefined && { retailPrice: Math.round(Number(data.retailPrice)) }),
        ...(data.wholesalePrice !== undefined && { wholesalePrice: Math.round(Number(data.wholesalePrice)) }),
        ...(data.capitalPrice !== undefined && { capitalPrice: Math.round(Number(data.capitalPrice)) }),
        ...(data.stock !== undefined && { stock: Math.round(Number(data.stock)) }),
        ...(data.unit && { unit: String(data.unit) }),
        ...(data.lowStockThreshold !== undefined && { lowStockThreshold: Math.round(Number(data.lowStockThreshold)) }),
        ...(data.isApproved !== undefined && { isApproved: Boolean(data.isApproved) }),
        ...(data.approvedBy && { approvedBy: String(data.approvedBy) }),
      },
    })

    return NextResponse.json(product)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

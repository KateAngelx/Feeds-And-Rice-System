// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: String(data.name) }),
        ...(data.retailPrice !== undefined && { retailPrice: Math.round(Number(data.retailPrice)) }),
        ...(data.wholesalePrice !== undefined && { wholesalePrice: Math.round(Number(data.wholesalePrice)) }),
        ...(data.capitalPrice !== undefined && { capitalPrice: Math.round(Number(data.capitalPrice)) }),
        ...(data.stock !== undefined && { stock: Math.round(Number(data.stock)) }),
        ...(data.isApproved !== undefined && { isApproved: Boolean(data.isApproved) }),
        ...(data.approvedBy && { approvedBy: String(data.approvedBy) }),
      },
    })

    return NextResponse.json(product)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
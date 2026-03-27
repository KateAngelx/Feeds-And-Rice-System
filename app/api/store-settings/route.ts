import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET store settings
export async function GET() {
  try {
    let settings = await prisma.storeSettings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.storeSettings.create({
        data: {
          name: 'Feeds and Rice Store',
          address: 'Main Street',
          phone: '(555) 123-4567',
          receiptFooter: 'Thank you for your business!',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update store settings
export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json()

    let settings = await prisma.storeSettings.findFirst()

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          name: data.name || 'Feeds and Rice Store',
          address: data.address || 'Main Street',
          phone: data.phone || '(555) 123-4567',
          receiptFooter: data.receiptFooter || 'Thank you for your business!',
        },
      })
    } else {
      settings = await prisma.storeSettings.update({
        where: { id: settings.id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.address && { address: data.address }),
          ...(data.phone && { phone: data.phone }),
          ...(data.receiptFooter && { receiptFooter: data.receiptFooter }),
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

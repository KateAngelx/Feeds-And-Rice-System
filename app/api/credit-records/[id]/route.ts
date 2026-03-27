import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await prisma.creditRecord.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Credit record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error fetching credit record:", error);
    return NextResponse.json(
      { error: "Failed to fetch credit record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.creditRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting credit record:", error);
    return NextResponse.json(
      { error: "Failed to delete credit record" },
      { status: 500 }
    );
  }
}

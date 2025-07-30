import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  // Check user session and role
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { productId, variantId, stock } = await req.json();

    if (!productId || !variantId || typeof stock !== 'number' || stock < 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Update variant stock in DB
    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    console.error('Failed to update variant stock:', error);
    return NextResponse.json({ error: 'Failed to update variant stock' }, { status: 500 });
  }
}

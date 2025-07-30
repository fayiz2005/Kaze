import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  context: { params: any }
) {
  const { id } = context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  return NextResponse.json(product);
}

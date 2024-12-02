import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const ingredients = await prisma.product.findMany({
      select: {
        id: true,
        // product: true,
      },
    });
    return NextResponse.json(ingredients, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch ingredients', error }, { status: 500 });
  }
}

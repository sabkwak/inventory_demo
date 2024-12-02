import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Handle GET request
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
  
    if (id) {
      // Fetch a single product (ingredient) by ID
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
        include: {
          brand: true,
          category: true,
        },
      });
  
      if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
  
      return NextResponse.json(product, { status: 200 });
    } else {
      // Fetch all products for the index page
      const products = await prisma.product.findMany({
        select: {
          id: true,
          product: true, // Correct field name
        },
      });
  
      return NextResponse.json(products, { status: 200 });
    }
  }
  

// If you want to handle other methods like POST, you can add those here, for example:
export async function POST(req: NextRequest) {
    // Implement POST logic here
    return NextResponse.json({ message: "POST request received" });
}

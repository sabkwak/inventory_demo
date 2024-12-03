import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const unitIdParam = searchParams.get("id"); // Unit ID query param
  const productIdParam = searchParams.get("productId"); // Product ID query param

  // Handle fetching by unit ID
  if (unitIdParam) {
    const unitIdSchema = z.number().int().positive();
    const parseResult = unitIdSchema.safeParse(Number(unitIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const unitId = parseResult.data;
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json({ name: unit.name });
  }

  // Handle fetching by product ID
  if (productIdParam) {
    const productIdSchema = z.number().int().positive();
    const parseResult = productIdSchema.safeParse(Number(productIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const productId = parseResult.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { unit: true }, // Include the associated unit
    });

    if (!product || !product.unit) {
      return NextResponse.json(
        { error: "Product or associated unit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ name: product.unit });
  }

  // If no specific query param is provided, return all units
  const units = await prisma.unit.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(units);
}

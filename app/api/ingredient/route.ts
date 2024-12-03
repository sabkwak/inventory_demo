import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ingredientIdParam = searchParams.get("id");

  if (!ingredientIdParam) {
    return NextResponse.json({ error: "Ingredient ID is required" }, { status: 400 });
  }

  // Validate ingredientId as a positive integer
  const ingredientIdSchema = z.number().int().positive();
  const parseResult = ingredientIdSchema.safeParse(Number(ingredientIdParam));

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid ingredient ID" }, { status: 400 });
  }

  const ingredientId = parseResult.data;

  // Fetch ingredient by ID, including its unit
  const ingredient = await prisma.product.findUnique({
    where: { id: ingredientId },
    include: {
      unit: true, // Include the unit relation
      brand: true, // Include the brand relation (optional)
    },
  });

  if (!ingredient) {
    return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
  }

  return NextResponse.json(ingredient);
}

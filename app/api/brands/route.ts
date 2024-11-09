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
  const brandIdParam = searchParams.get("id"); // Get 'id' from query params if available

  // If brandId is provided, fetch a specific brand by ID
  if (brandIdParam) {
    // Validate the brandId as a positive integer
    const brandIdSchema = z.number().int().positive();
    const parseResult = brandIdSchema.safeParse(Number(brandIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 });
    }

    const brandId = parseResult.data;

    // Fetch the brand by ID from the database
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ name: brand.name });
  }

  // If no brandId is provided, return all brands
  const brands = await prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(brands);
}

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
  const categoryIdParam = searchParams.get("id"); // Get 'id' from query params if available

  // If categoryId is provided, fetch a specific category by ID
  if (categoryIdParam) {
    // Validate the categoryId as a positive integer
    const categoryIdSchema = z.number().int().positive();
    const parseResult = categoryIdSchema.safeParse(Number(categoryIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const categoryId = parseResult.data;

    // Fetch the category by ID from the database
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ name: category.name });
  }

  // If no categoryId is provided, return all categories
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(categories);
}

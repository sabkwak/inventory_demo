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
  const growerIdParam = searchParams.get("id"); // Get 'id' from query params if available

  // If growerId is provided, fetch a specific grower by ID
  if (growerIdParam) {
    // Validate the growerId as a positive integer
    const growerIdSchema = z.number().int().positive();
    const parseResult = growerIdSchema.safeParse(Number(growerIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid grower ID" }, { status: 400 });
    }

    const growerId = parseResult.data;

    // Fetch the grower by ID from the database
    const grower = await prisma.grower.findUnique({
      where: { id: growerId },
    });

    if (!grower) {
      return NextResponse.json({ error: "Grower not found" }, { status: 404 });
    }

    return NextResponse.json({ name: grower.name });
  }

  // If no growerId is provided, return all growers
  const growers = await prisma.grower.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(growers);
}

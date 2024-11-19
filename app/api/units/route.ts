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
  const unitIdParam = searchParams.get("id"); // Get 'id' from query params if available

  // If unitId is provided, fetch a specific unit by ID
  if (unitIdParam) {
    // Validate the unitId as a positive integer
    const unitIdSchema = z.number().int().positive();
    const parseResult = unitIdSchema.safeParse(Number(unitIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const unitId = parseResult.data;

    // Fetch the unit by ID from the database
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json({ name: unit.name });
  }

  // If no unitId is provided, return all units
  const units = await prisma.unit.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(units);
}

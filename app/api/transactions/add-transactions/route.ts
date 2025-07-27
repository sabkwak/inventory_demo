import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productIdParam = searchParams.get("productId");
  if (!productIdParam) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }
  const productId = Number(productIdParam);
  if (isNaN(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  // Only fetch 'add' transactions for this product
  const addTransactions = await prisma.transaction.findMany({
    where: {
      productId,
      type: "add",
    },
    orderBy: { date: "asc" },
  });

  // Optionally, add logic to calculate remaining quantity per batch here

  return NextResponse.json(addTransactions);
}
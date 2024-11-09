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
  const transactionIdParam = searchParams.get("id"); // Get 'id' from query params if available

  // If transactionId is provided, fetch a specific transaction by ID
  if (transactionIdParam) {
    // Validate the transactionId as a positive integer
    const transactionIdSchema = z.number().int().positive();
    const parseResult = transactionIdSchema.safeParse(Number(transactionIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid transaction ID" }, { status: 400 });
    }

    const transactionId = parseResult.data;

    // Fetch the transaction by ID from the database
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    return NextResponse.json({ id: transaction.id });
  }

  // If no transactionId is provided, return all transactions
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return NextResponse.json(transactions);
}

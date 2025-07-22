import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const productIdParam = searchParams.get("productId");
  if (!productIdParam) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }
  const productId = Number(productIdParam);
  if (isNaN(productId) || productId <= 0) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  // Fetch all 'add' transactions for this product
  const addTransactions = await prisma.transaction.findMany({
    where: {
      productId,
      type: "add",
    },
    orderBy: { date: "asc" },
  });

  // For each add transaction, calculate how much has been consumed by 'sold', 'waste', or 'subtract' transactions
  // (Assume FIFO: oldest add transactions are consumed first)
  // We'll need all subtracting transactions for this product
  const subtractingTransactions = await prisma.transaction.findMany({
    where: {
      productId,
      type: { in: ["sold", "waste", "subtract"] },
    },
    orderBy: { date: "asc" },
  });

  // Build a list of add transactions with remaining quantity
  let remainingToConsume = subtractingTransactions.reduce((sum, t) => sum + t.amount, 0);
  const addTransactionsWithRemaining = addTransactions.map((addTx) => {
    let consumed = 0;
    if (remainingToConsume > 0) {
      consumed = Math.min(addTx.amount, remainingToConsume);
      remainingToConsume -= consumed;
    }
    return {
      ...addTx,
      remaining: addTx.amount - consumed,
      consumed,
    };
  });

  return NextResponse.json(addTransactionsWithRemaining);
} 
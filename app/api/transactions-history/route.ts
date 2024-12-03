import { GetFormatterForWeight } from "@/lib/helpers";
import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
  });

  if (!queryParams.success) {
    return new Response(JSON.stringify({ error: queryParams.error.message }), {
      status: 400,
    });
  }

  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return new Response(JSON.stringify(transactions));
}

export type GetTransactionHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

// Function to fetch the transaction history with brand, ingredient, category, and client included
async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
  if (!userSettings) {
    throw new Error("user settings not found");
  }

  // const formatter = GetFormatterForWeight(userSettings.weight);

  // Fetch transactions including product's brand, category, and client
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: "desc",
    },
    include: {
      product: {
        select: {
          product: true,  // Include product name
          category: {
            select: {
              name: true, // Include category name
            },
          },
          unit: {
            select: {
              name: true,
            },
          },
          brand: {
            select: {
              name: true, // Include brand name
            },
          },
        },
      },

    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    productName: transaction.product?.product || "---",  // Add product name
    brandName: transaction.product?.brand?.name || "---",  // Add brand name
    categoryName: transaction.product?.category?.name || "---",  // Add category name
    amount: transaction.amount,  // Format the amount based on user weight
    unitName: transaction.product.unit?.name || "",

  }));
}

import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs";
import { Return } from "@prisma/client/runtime/library";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({ from, to });
  if (!queryParams.success) {
    throw new Error(queryParams.error.message);
  }

  const stats = await getProductsStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );
  return Response.json(stats);
}

export type GetProductsStatsResponseType = Awaited<
  ReturnType<typeof getProductsStats>
>;

async function getProductsStats(userId: string, from: Date, to: Date) {
  const stats = await prisma.transaction.groupBy({
    by: ["type", "productId"],
    where: {
    //   userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  // Fetch product details for each productId
  const productIds = Array.from(new Set(stats.map(stat => stat.productId)));
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      product: true,
    },
  });

  // Create a map of productId to product name
  const productMap = new Map(products.map(product => [product.id, product.product]));

  // Add product names to the stats
  const statsWithProductNames = stats.map(stat => ({
    ...stat,
    productName: productMap.get(stat.productId) || `Product ${stat.productId}`,
  }));

  return statsWithProductNames;
}
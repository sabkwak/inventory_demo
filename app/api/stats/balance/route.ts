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
  if (from === null || to === null) {
    return new Response(JSON.stringify({ error: "Missing from or to parameter" }), {
      status: 400,
    });
  }
  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return new Response(JSON.stringify({ error: queryParams.error.message }), {
      status: 400,
    });
  }

  const stats = await getBalanceStats(user.id, from, to);

  return new Response(JSON.stringify(stats));
}

export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;

async function getBalanceStats(from: string, to: string) {
  const flowerCategoryId = 1;  // Assuming Flower has category ID 1
  const miscCategoryId = 2;    // Assuming Misc has category ID 2

  const flowerBalance = await prisma.product.aggregate({
    where: {
      categoryId: 1,
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const miscBalance = await prisma.product.aggregate({
    where: {
      categoryId: 2,
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    _sum: {
      quantity: true,
    },
  });

    const totalQuantity = await prisma.product.aggregate({
      _sum: {
        quantity: true,
      },
    });
  
  return {
    flowerBalance: flowerBalance._sum.quantity || 0,
    miscBalance: miscBalance._sum.quantity || 0,
    totalBalance: totalQuantity._sum.quantity || 0,
  };
}

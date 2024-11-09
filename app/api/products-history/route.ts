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

  // Fetch total count of products (for pagination)

  // Fetch products with pagination
  const products = await getProductsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to,
   
  );

  return new Response(JSON.stringify(products));

}

export type GetProductHistoryResponseType = Awaited<
  ReturnType<typeof getProductsHistory>
>;

async function getProductsHistory(
  userId: string,
  from: Date,
  to: Date,
) {
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
  if (!userSettings) {
    throw new Error("User settings not found");
  }

  const products = await prisma.product.findMany({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      grower: {
        select: {
          name: true,
        },
      },
    },
     });

  return products.map((product) => ({
    ...product,
    productName: product.product || "---",
    growerName: product.grower?.name || "---",
    categoryName: product.category?.name || "---",
    // date: product.createdAt,
  }));
}

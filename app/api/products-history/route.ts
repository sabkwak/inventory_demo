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
    user.emailAddresses[0]?.emailAddress || user.phoneNumbers[0]?.phoneNumber,
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


  const products = await prisma.product.findMany({
    where: {
      userId,
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
      unit: {
        select: {
          name: true,
        },
      },
      brand: {
        select: {
          name: true,
        },
      },
    },
     });

  return products.map((product) => ({
    ...product,
    productName: product.product || "---",
    brandName: product.brand?.name || "---",
    categoryName: product.category?.name || "---",
    unitName: product.unit?.name || "",

    // date: product.createdAt,
  }));
}

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const breakdown = await getCategoryBreakdown();
  return Response.json(breakdown);
}

export type GetCategoryBreakdownResponseType = Awaited<
  ReturnType<typeof getCategoryBreakdown>
>;

async function getCategoryBreakdown() {
  // Get products with their categories
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      unit: true,
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });

  // Group by category
  const categoryMap = new Map<string, {
    name: string;
    totalQuantity: number;
    totalValue: number;
    productCount: number;
    transactionCount: number;
    products: Array<{
      id: number;
      name: string;
      quantity: number;
      value: number;
      brand: string;
      unit: string;
    }>;
  }>();

  products.forEach(product => {
    const categoryName = product.category?.name || 'Uncategorized';
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        totalQuantity: 0,
        totalValue: 0,
        productCount: 0,
        transactionCount: 0,
        products: [],
      });
    }

    const category = categoryMap.get(categoryName)!;
    category.totalQuantity += product.quantity;
    category.totalValue += product.value || 0;
    category.productCount += 1;
    category.transactionCount += product._count.transactions;
    
    category.products.push({
      id: product.id,
      name: product.product,
      quantity: product.quantity,
      value: product.value || 0,
      brand: product.brand.name,
      unit: product.unit?.name || 'N/A',
    });
  });

  return Array.from(categoryMap.values());
} 
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const performance = await getBrandPerformance();
  return Response.json(performance);
}

export type GetBrandPerformanceResponseType = Awaited<
  ReturnType<typeof getBrandPerformance>
>;

async function getBrandPerformance() {
  // Get brands with their products and transactions
  const brands = await prisma.brand.findMany({
    include: {
      products: {
        include: {
          transactions: {
            where: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
          category: true,
          unit: true,
        },
      },
    },
  });

  const brandStats = brands.map(brand => {
    const products = brand.products;
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.value || 0), 0);
    
    // Calculate transaction activity (last 30 days)
    const transactions = products.flatMap(p => p.transactions);
    const totalTransactions = transactions.length;
    const recentActivity = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate average turnover rate
    const avgTurnover = totalQuantity > 0 ? recentActivity / totalQuantity : 0;
    
    // Low stock products (quantity < 10)
    const lowStockProducts = products.filter(p => p.quantity < 10).length;
    
    // Most used products
    const productActivity = products.map(p => ({
      name: p.product,
      quantity: p.quantity,
      transactions: p.transactions.length,
      category: p.category?.name || 'Uncategorized',
      unit: p.unit?.name || 'N/A',
    })).sort((a, b) => b.transactions - a.transactions);

    return {
      id: brand.id,
      name: brand.name,
      totalProducts,
      totalQuantity,
      totalValue,
      totalTransactions,
      recentActivity,
      avgTurnover,
      lowStockProducts,
      topProducts: productActivity.slice(0, 5),
      performanceScore: Math.min(100, Math.round(
        (totalTransactions * 10 + avgTurnover * 50 + (totalProducts - lowStockProducts) * 5)
      )),
    };
  });

  return brandStats.sort((a, b) => b.performanceScore - a.performanceScore);
} 
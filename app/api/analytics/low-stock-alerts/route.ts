import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const threshold = parseInt(searchParams.get("threshold") || "10");

  const alerts = await getLowStockAlerts(threshold);
  return Response.json(alerts);
}

export type GetLowStockAlertsResponseType = Awaited<
  ReturnType<typeof getLowStockAlerts>
>;

async function getLowStockAlerts(threshold: number) {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      quantity: {
        lte: threshold,
      },
    },
    include: {
      brand: true,
      category: true,
      unit: true,
      transactions: {
        take: 5,
        orderBy: {
          date: 'desc',
        },
      },
    },
    orderBy: {
      quantity: 'asc',
    },
  });

  const alerts = await Promise.all(
    lowStockProducts.map(async product => {
      // Calculate usage trend (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          productId: product.id,
          date: {
            gte: thirtyDaysAgo,
          },
        },
      });

      const totalUsage = recentTransactions
        .filter(t => t.type === 'subtract')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const avgDailyUsage = totalUsage / 30;
      const daysUntilEmpty = avgDailyUsage > 0 ? Math.ceil(product.quantity / avgDailyUsage) : null;

      return {
        id: product.id,
        name: product.product,
        quantity: product.quantity,
        brand: product.brand.name,
        category: product.category?.name || 'Uncategorized',
        unit: product.unit?.name || 'N/A',
        value: product.value || 0,
        avgDailyUsage: Math.round(avgDailyUsage * 100) / 100,
        daysUntilEmpty,
        recentTransactions: product.transactions.map(t => ({
          date: t.date,
          amount: t.amount,
          type: t.type,
        })),
        alertLevel: product.quantity === 0 ? 'critical' : 
                   product.quantity <= threshold * 0.3 ? 'high' : 
                   product.quantity <= threshold * 0.6 ? 'medium' : 'low',
      };
    })
  );

  return alerts;
} 
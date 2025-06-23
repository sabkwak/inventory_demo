import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const trends = await getInventoryTrends(days);
  return Response.json(trends);
}

export type GetInventoryTrendsResponseType = Awaited<
  ReturnType<typeof getInventoryTrends>
>;

async function getInventoryTrends(days: number) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get daily transaction data
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      product: {
        include: {
          category: true,
          brand: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Group transactions by date
  const dailyData = new Map<string, {
    date: string;
    totalValue: number;
    totalQuantity: number;
    additions: number;
    subtractions: number;
    categoryBreakdown: { [key: string]: number };
  }>();

  // Initialize all dates in range
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    dailyData.set(dateStr, {
      date: dateStr,
      totalValue: 0,
      totalQuantity: 0,
      additions: 0,
      subtractions: 0,
      categoryBreakdown: {},
    });
  }

  // Process transactions
  transactions.forEach(transaction => {
    const dateStr = transaction.date.toISOString().split('T')[0];
    const data = dailyData.get(dateStr);
    
    if (data) {
      const value = (transaction.price || 0) * transaction.amount;
      data.totalValue += value;
      data.totalQuantity += transaction.amount;
      
      if (transaction.type === 'add') {
        data.additions += transaction.amount;
      } else {
        data.subtractions += transaction.amount;
      }

      // Category breakdown
      const categoryName = transaction.product.category?.name || 'Uncategorized';
      data.categoryBreakdown[categoryName] = (data.categoryBreakdown[categoryName] || 0) + transaction.amount;
    }
  });

  return Array.from(dailyData.values());
} 
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // Fetch all products with their transactions
  const products = await prisma.product.findMany({
    include: { transactions: true }
  });

  // Calculate P&L for each product
  const report = products.map(product => {
    const soldTransactions = product.transactions.filter(t => t.type === "sold");
    const addTransactions = product.transactions.filter(t => t.type === "add");

    // Revenue: sum of sold transaction prices
    const revenue = soldTransactions.reduce((sum, t) => sum + (t.price ?? 0), 0);

    // Cost: sum of add transaction prices
    const cost = addTransactions.reduce((sum, t) => sum + (t.price ?? 0), 0);

    return {
      id: product.id,
      name: product.product,
      revenue,
      cost,
      profit: revenue - cost,
    };
  });

  // Optionally, calculate overall KPIs
  const totalRevenue = report.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = report.reduce((sum, p) => sum + p.cost, 0);
  const totalProfit = report.reduce((sum, p) => sum + p.profit, 0);

  return NextResponse.json({
    products: report,
    kpis: {
      totalRevenue,
      totalCost,
      totalProfit,
    }
  });
}
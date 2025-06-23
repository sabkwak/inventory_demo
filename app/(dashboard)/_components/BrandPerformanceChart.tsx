"use client";

import { GetBrandPerformanceResponseType } from "@/app/api/analytics/brand-performance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Award, TrendingUp, Package, AlertTriangle } from "lucide-react";
import React from "react";

// Demo data generator
function generateDemoBrandData() {
  return Promise.resolve([
    {
      id: 1,
      name: "Organic Valley",
      totalProducts: 3,
      totalQuantity: 48,
      totalValue: 129,
      totalTransactions: 15,
      recentActivity: 25,
      avgTurnover: 0.52,
      lowStockProducts: 1,
      topProducts: [
        { name: "Organic Tomatoes", quantity: 25, transactions: 8, category: "Vegetables", unit: "lbs" },
        { name: "Organic Carrots", quantity: 15, transactions: 4, category: "Vegetables", unit: "lbs" },
        { name: "Fresh Spinach", quantity: 8, transactions: 3, category: "Vegetables", unit: "lbs" },
      ],
      performanceScore: 85,
    },
    {
      id: 2,
      name: "Fresh Farms",
      totalProducts: 2,
      totalQuantity: 51,
      totalValue: 108,
      totalTransactions: 12,
      recentActivity: 18,
      avgTurnover: 0.35,
      lowStockProducts: 0,
      topProducts: [
        { name: "Honey Crisp Apples", quantity: 45, transactions: 8, category: "Fruits", unit: "lbs" },
        { name: "Fresh Basil", quantity: 6, transactions: 4, category: "Spices", unit: "oz" },
      ],
      performanceScore: 72,
    },
    {
      id: 3,
      name: "Local Harvest",
      totalProducts: 2,
      totalQuantity: 5,
      totalValue: 20,
      totalTransactions: 6,
      recentActivity: 8,
      avgTurnover: 1.6,
      lowStockProducts: 2,
      topProducts: [
        { name: "Whole Wheat Flour", quantity: 3, transactions: 3, category: "Grains", unit: "lbs" },
        { name: "Black Pepper", quantity: 2, transactions: 3, category: "Spices", unit: "oz" },
      ],
      performanceScore: 45,
    },
    {
      id: 4,
      name: "Premium Foods",
      totalProducts: 1,
      totalQuantity: 0,
      totalValue: 0,
      totalTransactions: 5,
      recentActivity: 12,
      avgTurnover: 0,
      lowStockProducts: 1,
      topProducts: [
        { name: "Organic Milk", quantity: 0, transactions: 5, category: "Dairy", unit: "kg" },
      ],
      performanceScore: 25,
    },
  ]);
}

interface Props {
  demoMode?: boolean;
}

function BrandPerformanceChart({ demoMode = false }: Props) {
  const performanceQuery = useQuery<GetBrandPerformanceResponseType>({
    queryKey: ["analytics", "brand-performance", demoMode],
    queryFn: () => {
      if (demoMode) {
        return generateDemoBrandData();
      }
      return fetch(`/api/analytics/brand-performance`).then((res) => res.json());
    },
  });

  const data = performanceQuery.data || [];

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", variant: "default" as const };
    if (score >= 60) return { label: "Good", variant: "secondary" as const };
    if (score >= 40) return { label: "Average", variant: "outline" as const };
    return { label: "Needs Attention", variant: "destructive" as const };
  };

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Ingredient Supplier Performance
        </CardTitle>
        <CardDescription>
          Performance metrics and insights for each ingredient supplier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SkeletonWrapper isLoading={performanceQuery.isFetching}>
          {data.length === 0 ? (
                         <div className="flex h-64 items-center justify-center text-muted-foreground">
               No supplier data available
             </div>
          ) : (
            <div className="space-y-6">
              {/* Top Performers Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">Top Performer</span>
                  </div>
                  {data[0] && (
                    <div>
                      <p className="text-lg font-bold">{data[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {data[0].performanceScore}/100
                      </p>
                    </div>
                  )}
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Most Active</span>
                  </div>
                  {data.sort((a, b) => b.totalTransactions - a.totalTransactions)[0] && (
                    <div>
                      <p className="text-lg font-bold">
                        {data.sort((a, b) => b.totalTransactions - a.totalTransactions)[0].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.sort((a, b) => b.totalTransactions - a.totalTransactions)[0].totalTransactions} transactions
                      </p>
                    </div>
                  )}
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Largest Inventory</span>
                  </div>
                  {data.sort((a, b) => b.totalQuantity - a.totalQuantity)[0] && (
                    <div>
                      <p className="text-lg font-bold">
                        {data.sort((a, b) => b.totalQuantity - a.totalQuantity)[0].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {data.sort((a, b) => b.totalQuantity - a.totalQuantity)[0].totalQuantity} units
                      </p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Detailed Brand List */}
              <div className="space-y-4">
                                 <h3 className="text-lg font-semibold">Supplier Details</h3>
                <div className="grid gap-4">
                  {data.map((brand) => {
                    const badge = getPerformanceBadge(brand.performanceScore);
                    return (
                      <Card key={brand.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="text-lg font-semibold">{brand.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={badge.variant}>{badge.label}</Badge>
                                <span className={`text-sm font-medium ${getPerformanceColor(brand.performanceScore)}`}>
                                  {brand.performanceScore}/100
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {brand.lowStockProducts > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {brand.lowStockProducts} low stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Performance Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Performance Score</span>
                            <span>{brand.performanceScore}%</span>
                          </div>
                          <Progress value={brand.performanceScore} className="h-2" />
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Products</p>
                            <p className="text-lg font-semibold">{brand.totalProducts}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Quantity</p>
                            <p className="text-lg font-semibold">{brand.totalQuantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Value</p>
                            <p className="text-lg font-semibold">${brand.totalValue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Turnover Rate</p>
                            <p className="text-lg font-semibold">{(brand.avgTurnover * 100).toFixed(1)}%</p>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Recent Activity (30 days)</span>
                            <span className="text-sm text-muted-foreground">
                              {brand.totalTransactions} transactions
                            </span>
                          </div>
                          
                          {/* Top Products */}
                          {brand.topProducts.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Most Active Products:</p>
                              <div className="flex flex-wrap gap-1">
                                {brand.topProducts.slice(0, 3).map((product, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {product.name} ({product.transactions})
                                  </Badge>
                                ))}
                                {brand.topProducts.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{brand.topProducts.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </SkeletonWrapper>
      </CardContent>
    </Card>
  );
}

export default BrandPerformanceChart; 
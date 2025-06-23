"use client";

import { GetInventoryTrendsResponseType } from "@/app/api/analytics/inventory-trends/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";

// Demo data generator
function generateDemoTrendsData(days: number) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.push({
      date: dateStr,
      totalValue: Math.random() * 200 + 100,
      totalQuantity: Math.random() * 50 + 20,
      additions: Math.random() * 15 + 5,
      subtractions: Math.random() * 10 + 2,
      categoryBreakdown: {
        Vegetables: Math.random() * 20 + 10,
        Fruits: Math.random() * 15 + 5,
        Grains: Math.random() * 10 + 3,
        Dairy: Math.random() * 8 + 2,
        Spices: Math.random() * 5 + 1,
      },
    });
  }
  return Promise.resolve(data);
}

interface Props {
  initialDays?: number;
  demoMode?: boolean;
}

function InventoryTrendsChart({ initialDays = 30, demoMode = false }: Props) {
  const [days, setDays] = useState(initialDays);

  const trendsQuery = useQuery<GetInventoryTrendsResponseType>({
    queryKey: ["analytics", "inventory-trends", days, demoMode],
    queryFn: () => {
      if (demoMode) {
        return generateDemoTrendsData(days);
      }
      return fetch(`/api/analytics/inventory-trends?days=${days}`).then((res) => res.json());
    },
  });

  const data = trendsQuery.data || [];

  // Calculate summary stats
  const totalValue = data.reduce((sum, d) => sum + d.totalValue, 0);
  const totalQuantity = data.reduce((sum, d) => sum + d.totalQuantity, 0);
  const totalAdditions = data.reduce((sum, d) => sum + d.additions, 0);
  const totalSubtractions = data.reduce((sum, d) => sum + d.subtractions, 0);

  return (
    <Card className="col-span-12">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Inventory Trends
            </CardTitle>
            <CardDescription>
              Track inventory movements and value changes over time
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={days === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(7)}
            >
              7 Days
            </Button>
            <Button
              variant={days === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(30)}
            >
              30 Days
            </Button>
            <Button
              variant={days === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(90)}
            >
              90 Days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SkeletonWrapper isLoading={trendsQuery.isFetching}>
          {data.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              No transaction data available for the selected period
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Quantity</p>
                    <p className="text-lg font-bold">{totalQuantity.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Additions</p>
                    <p className="text-lg font-bold text-green-600">{totalAdditions.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Subtractions</p>
                    <p className="text-lg font-bold text-red-600">{totalSubtractions.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="h-5 w-5 bg-purple-600 rounded"></div>
                  <div>
                    <p className="text-sm font-medium">Total Value</p>
                    <p className="text-lg font-bold">${totalValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="space-y-6">
                {/* Quantity Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Quantity Movements</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number, name: string) => [
                          value.toFixed(1),
                          name === 'additions' ? 'Additions' : 
                          name === 'subtractions' ? 'Subtractions' : 'Total Quantity'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="additions"
                        stackId="1"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="subtractions"
                        stackId="2"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Value Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Value Trends</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalValue"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </SkeletonWrapper>
      </CardContent>
    </Card>
  );
}

export default InventoryTrendsChart; 
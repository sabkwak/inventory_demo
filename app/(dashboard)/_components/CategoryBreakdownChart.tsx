"use client";

import { GetCategoryBreakdownResponseType } from "@/app/api/analytics/category-breakdown/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Package, Users, Activity } from "lucide-react";
import React from "react";
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C',
  '#8DD1E1', '#D084D0'
];

// Demo data generator
function generateDemoCategoryData() {
  return Promise.resolve([
    {
      name: "Vegetables",
      totalQuantity: 48,
      totalValue: 129,
      productCount: 3,
      transactionCount: 15,
      products: [
        { id: 1, name: "Organic Tomatoes", quantity: 25, value: 75, brand: "Organic Valley", unit: "lbs" },
        { id: 2, name: "Fresh Spinach", quantity: 8, value: 24, brand: "Organic Valley", unit: "lbs" },
        { id: 7, name: "Organic Carrots", quantity: 15, value: 30, brand: "Organic Valley", unit: "lbs" },
      ],
    },
    {
      name: "Fruits",
      totalQuantity: 45,
      totalValue: 90,
      productCount: 1,
      transactionCount: 8,
      products: [
        { id: 3, name: "Honey Crisp Apples", quantity: 45, value: 90, brand: "Fresh Farms", unit: "lbs" },
      ],
    },
    {
      name: "Grains",
      totalQuantity: 3,
      totalValue: 12,
      productCount: 1,
      transactionCount: 3,
      products: [
        { id: 4, name: "Whole Wheat Flour", quantity: 3, value: 12, brand: "Local Harvest", unit: "lbs" },
      ],
    },
    {
      name: "Dairy",
      totalQuantity: 0,
      totalValue: 0,
      productCount: 1,
      transactionCount: 5,
      products: [
        { id: 5, name: "Organic Milk", quantity: 0, value: 0, brand: "Premium Foods", unit: "kg" },
      ],
    },
    {
      name: "Spices",
      totalQuantity: 8,
      totalValue: 26,
      productCount: 2,
      transactionCount: 7,
      products: [
        { id: 6, name: "Black Pepper", quantity: 2, value: 8, brand: "Local Harvest", unit: "oz" },
        { id: 8, name: "Fresh Basil", quantity: 6, value: 18, brand: "Fresh Farms", unit: "oz" },
      ],
    },
  ]);
}

interface Props {
  demoMode?: boolean;
}

function CategoryBreakdownChart({ demoMode = false }: Props) {
  const categoryQuery = useQuery<GetCategoryBreakdownResponseType>({
    queryKey: ["analytics", "category-breakdown", demoMode],
    queryFn: () => {
      if (demoMode) {
        return generateDemoCategoryData();
      }
      return fetch(`/api/analytics/category-breakdown`).then((res) => res.json());
    },
  });

  const data = categoryQuery.data || [];

  // Prepare data for charts
  const pieData = data.map((category, index) => ({
    name: category.name,
    value: category.totalQuantity,
    color: COLORS[index % COLORS.length],
  }));

  const barData = data.map((category, index) => ({
    name: category.name,
    quantity: category.totalQuantity,
    value: category.totalValue,
    products: category.productCount,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Category Distribution
          </CardTitle>
          <CardDescription>
            Inventory breakdown by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkeletonWrapper isLoading={categoryQuery.isFetching}>
            {data.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No category data available
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value: number, name) => [`${value} units`, name]} />
                    <RechartsPieChart dataKey="value" data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}</span>
                      <span className="text-xs text-muted-foreground">({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Category Details
          </CardTitle>
          <CardDescription>
            Detailed breakdown of each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkeletonWrapper isLoading={categoryQuery.isFetching}>
            {data.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No category data available
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {data.map((category, index) => (
                  <div key={category.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <h3 className="font-semibold">{category.name}</h3>
                      </div>
                      <Badge variant="secondary">
                        {category.productCount} products
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-medium">{category.totalQuantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Value</p>
                        <p className="font-medium">${category.totalValue}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-medium">{category.transactionCount}</p>
                      </div>
                    </div>

                    {/* Top products in category */}
                    {category.products.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Top Products:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.products.slice(0, 3).map((product) => (
                            <Badge key={product.id} variant="outline" className="text-xs">
                              {product.name} ({product.quantity})
                            </Badge>
                          ))}
                          {category.products.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.products.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>

      {/* Bar Chart - spans both columns */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Category Comparison
          </CardTitle>
          <CardDescription>
            Compare quantity and value across categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkeletonWrapper isLoading={categoryQuery.isFetching}>
            {data.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'quantity' ? `${value} units` : `$${value}`,
                      name === 'quantity' ? 'Quantity' : 'Value'
                    ]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="quantity"
                    fill="#0088FE"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="value"
                    fill="#00C49F"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

export default CategoryBreakdownChart; 
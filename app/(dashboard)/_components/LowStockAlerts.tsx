"use client";

import { GetLowStockAlertsResponseType } from "@/app/api/analytics/low-stock-alerts/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, Package, TrendingDown } from "lucide-react";
import React, { useState } from "react";
import CreateTransactionDialog from "./CreateTransactionDialog";
import { UserSettings } from "@prisma/client";

// Demo data generator
function generateDemoAlertsData(threshold: number) {
  const allProducts = [
    {
      id: 5,
      name: "Organic Milk",
      quantity: 0,
      brand: "Premium Foods",
      category: "Dairy",
      unit: "kg",
      value: 0,
      avgDailyUsage: 2.5,
      daysUntilEmpty: 0,
      alertLevel: "critical" as const,
      recentTransactions: [
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), amount: 3, type: "subtract" },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), amount: 5, type: "add" },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), amount: 2, type: "subtract" },
      ],
    },
    {
      id: 6,
      name: "Black Pepper",
      quantity: 2,
      brand: "Local Harvest",
      category: "Spices",
      unit: "oz",
      value: 8,
      avgDailyUsage: 0.3,
      daysUntilEmpty: 7,
      alertLevel: "high" as const,
      recentTransactions: [
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), amount: 1, type: "subtract" },
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amount: 3, type: "add" },
      ],
    },
    {
      id: 4,
      name: "Whole Wheat Flour",
      quantity: 3,
      brand: "Local Harvest",
      category: "Grains",
      unit: "lbs",
      value: 12,
      avgDailyUsage: 0.4,
      daysUntilEmpty: 8,
      alertLevel: "high" as const,
      recentTransactions: [
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), amount: 2, type: "subtract" },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), amount: 5, type: "add" },
      ],
    },
    {
      id: 8,
      name: "Fresh Basil",
      quantity: 6,
      brand: "Fresh Farms",
      category: "Spices",
      unit: "oz",
      value: 18,
      avgDailyUsage: 0.5,
      daysUntilEmpty: 12,
      alertLevel: "medium" as const,
      recentTransactions: [
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), amount: 1, type: "subtract" },
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), amount: 4, type: "add" },
      ],
    },
    {
      id: 2,
      name: "Fresh Spinach",
      quantity: 8,
      brand: "Organic Valley",
      category: "Vegetables",
      unit: "lbs",
      value: 24,
      avgDailyUsage: 0.6,
      daysUntilEmpty: 13,
      alertLevel: "medium" as const,
      recentTransactions: [
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), amount: 2, type: "subtract" },
        { date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), amount: 6, type: "add" },
      ],
    },
  ];

  return Promise.resolve(allProducts.filter(p => p.quantity <= threshold));
}

interface Props {
  userSettings: UserSettings;
  demoMode?: boolean;
}

function LowStockAlerts({ userSettings, demoMode = false }: Props) {
  const [threshold, setThreshold] = useState(10);

  const alertsQuery = useQuery<GetLowStockAlertsResponseType>({
    queryKey: ["analytics", "low-stock-alerts", threshold, demoMode],
    queryFn: () => {
      if (demoMode) {
        return generateDemoAlertsData(threshold);
      }
      return fetch(`/api/analytics/low-stock-alerts?threshold=${threshold}`).then((res) => res.json());
    },
  });

  const alerts = alertsQuery.data || [];

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive' as const;
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getAlertBadgeText = (level: string) => {
    switch (level) {
      case 'critical':
        return 'Out of Stock';
      case 'high':
        return 'Critical';
      case 'medium':
        return 'Low';
      default:
        return 'Watch';
    }
  };

  const criticalAlerts = alerts.filter(a => a.alertLevel === 'critical');
  const highAlerts = alerts.filter(a => a.alertLevel === 'high');
  const mediumAlerts = alerts.filter(a => a.alertLevel === 'medium');
  const lowAlerts = alerts.filter(a => a.alertLevel === 'low');

  return (
    <Card className="col-span-12">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Monitor inventory levels and get usage predictions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Threshold:</span>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={5}>5 units</option>
              <option value={10}>10 units</option>
              <option value={20}>20 units</option>
              <option value={50}>50 units</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SkeletonWrapper isLoading={alertsQuery.isFetching}>
          {alerts.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p>All products are well stocked!</p>
                <p className="text-sm">No items below {threshold} units</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Critical</p>
                    <p className="text-lg font-bold">{criticalAlerts.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">High</p>
                    <p className="text-lg font-bold">{highAlerts.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Medium</p>
                    <p className="text-lg font-bold">{mediumAlerts.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Watch</p>
                    <p className="text-lg font-bold">{lowAlerts.length}</p>
                  </div>
                </div>
              </div>

              {/* Alert List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getAlertIcon(alert.alertLevel)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{alert.name}</h4>
                            <Badge variant={getAlertBadgeVariant(alert.alertLevel)}>
                              {getAlertBadgeText(alert.alertLevel)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Current Stock</p>
                              <p className="font-medium">
                                {alert.quantity} {alert.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Brand</p>
                              <p className="font-medium">{alert.brand}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Category</p>
                              <p className="font-medium">{alert.category}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Value</p>
                              <p className="font-medium">${alert.value}</p>
                            </div>
                          </div>

                          {/* Usage Prediction */}
                          {alert.avgDailyUsage > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Usage Prediction</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Daily Usage</p>
                                  <p className="font-medium">{alert.avgDailyUsage} {alert.unit}/day</p>
                                </div>
                                {alert.daysUntilEmpty && (
                                  <div>
                                    <p className="text-muted-foreground">Days Until Empty</p>
                                    <p className={`font-medium ${
                                      alert.daysUntilEmpty <= 7 ? 'text-red-600' :
                                      alert.daysUntilEmpty <= 14 ? 'text-orange-600' : 'text-green-600'
                                    }`}>
                                      ~{alert.daysUntilEmpty} days
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Recent Transactions */}
                          {alert.recentTransactions.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Recent Activity:</p>
                              <div className="flex flex-wrap gap-1">
                                {alert.recentTransactions.slice(0, 3).map((transaction, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {transaction.type === 'add' ? '+' : '-'}{transaction.amount} 
                                    ({new Date(transaction.date).toLocaleDateString()})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="ml-4">
                        <CreateTransactionDialog
                          userSettings={userSettings}
                          trigger={
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Restock
                            </Button>
                          }
                          type="add"
                          defaultProductId={alert.id}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </SkeletonWrapper>
      </CardContent>
    </Card>
  );
}

export default LowStockAlerts; 
"use client";

import { UserSettings } from "@prisma/client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Award, 
  AlertTriangle,
  Activity,
  Database,
  Eye,
  EyeOff,
  ArrowRight,
  Zap
} from "lucide-react";
import InventoryTrendsChart from "./InventoryTrendsChart";
import CategoryBreakdownChart from "./CategoryBreakdownChart";
import BrandPerformanceChart from "./BrandPerformanceChart";
import LowStockAlerts from "./LowStockAlerts";
import { useQuery } from "@tanstack/react-query";

// Quick stats types for demo data
type QuickStats = {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  alertCount: number;
  trendsData: {
    dailyMovement: number;
    weeklyGrowth: number;
  };
};

interface Props {
  userSettings: UserSettings;
}

// Demo stats generator
function generateQuickStats(): QuickStats {
  return {
    totalProducts: 8,
    totalCategories: 5,
    totalSuppliers: 4,
    alertCount: 5,
    trendsData: {
      dailyMovement: Math.floor(Math.random() * 20) + 10,
      weeklyGrowth: Math.floor(Math.random() * 15) + 5,
    },
  };
}

function AnalyticsDashboard({ userSettings }: Props) {
  const [demoMode, setDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  const handleCardClick = (tabName: string) => {
    setClickedCard(tabName);
    setTimeout(() => {
      setActiveTab(tabName);
      setClickedCard(null);
    }, 150);
  };

  // Quick stats query for overview cards
  const quickStatsQuery = useQuery<QuickStats>({
    queryKey: ["quick-stats", demoMode],
    queryFn: () => {
      if (demoMode) {
        return Promise.resolve(generateQuickStats());
      }
      // In real mode, you would fetch actual stats from your API
      return Promise.resolve({
        totalProducts: 0,
        totalCategories: 0,
        totalSuppliers: 0,
        alertCount: 0,
        trendsData: { dailyMovement: 0, weeklyGrowth: 0 },
      });
    },
    refetchInterval: demoMode ? 5000 : false, // Refresh demo data every 5 seconds
  });

  const stats = quickStatsQuery.data || {
    totalProducts: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    alertCount: 0,
    trendsData: { dailyMovement: 0, weeklyGrowth: 0 },
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          {demoMode && (
            <Badge variant="secondary" className="ml-2">
              <Database className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          )}
        </div>
        
        <Button
          variant={demoMode ? "default" : "outline"}
          onClick={() => setDemoMode(!demoMode)}
          className="flex items-center gap-2"
        >
          {demoMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {demoMode ? "Hide Demo Data" : "Show Demo Data"}
        </Button>
      </div>
      
      {demoMode && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Demo Mode Active</p>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Displaying sample data to demonstrate analytics functionality. This includes sample ingredients, 
                  suppliers, transactions, and stock levels to showcase all dashboard features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Key Metrics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Analytics Overview
                </CardTitle>
                <CardDescription>
                  Comprehensive view of your inventory analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div 
                    className={`flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-105 hover:shadow-lg group relative ${
                      clickedCard === "trends" ? "scale-95" : ""
                    }`}
                    onClick={() => handleCardClick("trends")}
                  >
                    <TrendingUp className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-blue-600 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trends Analysis</p>
                      <p className="text-lg font-bold">Track Movement</p>
                      <p className="text-xs text-muted-foreground">View quantity & value trends</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {demoMode ? `${stats.trendsData.dailyMovement} today` : "Real-time"}
                        </Badge>
                        {demoMode && (
                          <Badge variant="secondary" className="text-xs">
                            +{stats.trendsData.weeklyGrowth}% week
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg cursor-pointer transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105 hover:shadow-lg group relative ${
                      clickedCard === "categories" ? "scale-95" : ""
                    }`}
                    onClick={() => handleCardClick("categories")}
                  >
                    <PieChart className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-green-600 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category Insights</p>
                      <p className="text-lg font-bold">Distribution</p>
                      <p className="text-xs text-muted-foreground">Breakdown by category</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {demoMode ? `${stats.totalCategories} categories` : "Live data"}
                        </Badge>
                        {demoMode && (
                          <Badge variant="secondary" className="text-xs">
                            {stats.totalProducts} items
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg cursor-pointer transition-all duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:scale-105 hover:shadow-lg group relative ${
                      clickedCard === "brands" ? "scale-95" : ""
                    }`}
                    onClick={() => handleCardClick("brands")}
                  >
                    <Award className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-purple-600 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Supplier Performance</p>
                      <p className="text-lg font-bold">Rankings</p>
                      <p className="text-xs text-muted-foreground">Performance scores</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {demoMode ? `${stats.totalSuppliers} suppliers` : "Active"}
                        </Badge>
                        {demoMode && (
                          <Badge variant="secondary" className="text-xs">
                            Ranked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg cursor-pointer transition-all duration-200 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:scale-105 hover:shadow-lg group relative ${
                      clickedCard === "alerts" ? "scale-95" : ""
                    }`}
                    onClick={() => handleCardClick("alerts")}
                  >
                    <AlertTriangle className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
                    <ArrowRight className="h-4 w-4 text-orange-600 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {demoMode && stats.alertCount > 0 && (
                      <Zap className="h-4 w-4 text-orange-600 absolute top-2 left-2 animate-pulse" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stock Alerts</p>
                      <p className="text-lg font-bold">Monitoring</p>
                      <p className="text-xs text-muted-foreground">Low stock warnings</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={demoMode && stats.alertCount > 0 ? "destructive" : "outline"} className="text-xs">
                          {demoMode ? `${stats.alertCount} alerts` : "Monitoring"}
                        </Badge>
                        {demoMode && stats.alertCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Action needed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LowStockAlerts userSettings={userSettings} demoMode={demoMode} />
              <InventoryTrendsChart initialDays={7} demoMode={demoMode} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <InventoryTrendsChart demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryBreakdownChart demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <BrandPerformanceChart demoMode={demoMode} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <LowStockAlerts userSettings={userSettings} demoMode={demoMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsDashboard; 
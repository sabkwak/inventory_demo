"use client";
import React, { useEffect, useState } from "react";

type KPI = {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
};

export default function ProfitLossKPI() {
  const [kpi, setKpi] = useState<KPI | null>(null);

  useEffect(() => {
    fetch("/api/reports/profit-loss")
      .then(res => res.json())
      .then(data => setKpi(data.kpis));
  }, []);

  if (!kpi) return <div>Loading KPIs...</div>;

  return (
    <div className="container flex flex-wrap items-end justify-between gap-2 py-6">
      <div className="flex flex-col gap-1">
    <div className="grid grid-cols-3 gap-4 my-4">
      <div className="p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Total Revenue</h3>
        <p className="text-2xl text-green-600">${kpi.totalRevenue.toFixed(2)}</p>
      </div>
      <div className="p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Total Cost</h3>
        <p className="text-2xl text-red-600">${kpi.totalCost.toFixed(2)}</p>
      </div>
      <div className="p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Total Profit</h3>
        <p className="text-2xl text-blue-600">${kpi.totalProfit.toFixed(2)}</p>
      </div>
    </div>
    </div>
    </div>
  );
}
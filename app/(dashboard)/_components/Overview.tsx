"use client";

import ProductsStats from "@/app/(dashboard)/_components/ProductsStats";
import StatsCards from "@/app/(dashboard)/_components/StatsCards";
import AnalyticsDashboard from "@/app/(dashboard)/_components/AnalyticsDashboard";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { UserSettings } from "@prisma/client";
import { differenceInDays, startOfMonth, startOfQuarter, addDays } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";

function Overview({ userSettings }: { userSettings: UserSettings }) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Set 'from' date to January 1st of this year
    to: addDays(new Date(), 1), // Set the 'to' date to tomorrow
  });
  return (
    <>
      <div className="container flex flex-wrap items-end justify-between gap-2 py-6">
      <div className="flex flex-col gap-1">

        <h2 className="text-3xl font-bold">Overview</h2>
        <p className="text-sm text-gray-400">
85- here before your inventory gets 86&apos;d &#x1F480;</p>
      </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(values) => {
              const { from, to } = values.range;
              // We update the date range only if both dates are set

              if (!from || !to) return;
              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                toast.error(
                  `The selected date range is too big. Max allowed range is ${MAX_DATE_RANGE_DAYS} days!`
                );
                return;
              }

              setDateRange({ from, to });
            }}
          />
        </div>
      </div>
      <div className="container flex w-full flex-col gap-2">
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
        <ProductsStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard userSettings={userSettings} />

      <div className="container flex flex-wrap items-end justify-between gap-2 py-6">

      <div className="flex flex-col gap-1">
      <h2 className="text-3xl font-bold">New Features</h2>
      <p className="text-sm text-gray-400">-Add different &quot;Subtract Ingredient&quot; types- &quot;Waste&quot; and &quot;Sold&quot;. Please record complete &quot;Products&quot; that are ready to be sold instead of individual ingredients for now. </p>
      <p className="text-sm text-gray-400">-&quot;Create New Product&quot; now has expiry date, min stock, and sell price fields.</p>
<h2 className="text-3xl font-bold">To Do List</h2>
<p className="text-sm text-gray-400">Create relevant P&L KPIs for dashboard</p>
<p className="text-sm text-gray-400">Create P&L reports tab</p>
<p className="text-sm text-gray-400">Add &quot;Low in Stock&quot; metric to dashboard</p>
<p className="text-sm text-gray-400">Add QR code scanning feature to update inventory quantities upon request</p>

</div>
</div>
    </>
  );
}

export default Overview;

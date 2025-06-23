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
      <p className="text-sm text-gray-400 italic">(Psst! Hello! Thanks for checking out my demo for Project 85 :) I recommend you use this on a desktop and try out the &quot;View QR Code&quot; action on the Inventory page and scanning the QR code with your phone. Please let me know what features you&apos;d like to see next!</p>
<h2 className="text-3xl font-bold">Sabrina&apos;s To Do List</h2>
<p className="text-sm text-gray-400">
-Add optional &quot;minimum quantity&quot; field to &quot;Create New Ingredient&quot; window so when the user &quot;Subtracts&quot; an Ingredient and the quantity falls below the minimum, it shows up on this dashboard. The user will also be able to opt in for notifications</p>
<p className="text-sm text-gray-400">
-Create new user tutorial
</p>
<p className="text-sm text-gray-400">
-Add graphs/visuals/summaries to dashboard
</p>
<p className="text-sm text-gray-400">
-Improve mobile Inventory/Transaction Table views. User currently has to scroll horizontally to see all columns :/
</p>
</div>
</div>
    </>
  );
}

export default Overview;

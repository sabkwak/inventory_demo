"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfQuarter, addDays } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import InventoryTable from "./_components/InventoryTable";
import { Button } from "@/components/ui/button"; // Import the Button component
import CreateProductDialog from "@/app/(dashboard)/_components/CreateProductDialog"; // Import the CreateProductDialog component
import { useQuery } from "@tanstack/react-query";

function InventoryPage() {
  const userQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(`/api/products/user`).then((res) => res.json()),
  });
  const user = userQuery.data;
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Set 'from' date to January 1st of this year
    to: addDays(new Date(), 1), // Set the 'to' date to tomorrow
  });

  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Inventory</p>
          </div>
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
          <CreateProductDialog userSettings={user}
            trigger={<Button>Create New Product</Button>}
            successCallback={() => {
              // Logic to handle after a product is successfully created
              console.log("Ingredient created successfully");
            }}
          />
        </div>
      </div>
      <div className="container">
        <InventoryTable from={dateRange.from} to={dateRange.to} />
      </div>
    </>
  );
}

export default InventoryPage;
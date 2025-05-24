"use client";

import TransactionTable from "@/app/(dashboard)/transactions/_components/TransactionTable";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays, startOfMonth, startOfQuarter, addDays } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

function TransactionsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Set 'from' date to January 1st of this year
    to: addDays(new Date(), 1), // Set the 'to' date to tomorrow
  });
  const userQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(`/api/products/user`).then((res) => res.json()),
  });
  const user = userQuery.data;
  return (
    <>
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Inventory Adjustments History</p>
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
          <div className="flex items-center gap-3">
            <CreateTransactionDialog userSettings={user}
              trigger={
                <Button
                  variant={"outline"}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                  Add Ingredient
                </Button>
              }
              type="add"
            />

            <CreateTransactionDialog userSettings={user}
              trigger={
                <Button
                  variant={"outline"}
                  className="bg-gradient-to-r from-red-800 to-red-900 text-white hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                 Subtract Ingredient
                </Button>
              }
              type="subtract"
            />
          </div>
        </div>
      </div>

      <div className="container">
        <TransactionTable from={dateRange.from} to={dateRange.to} />
      </div>
    </>
  );
}

export default TransactionsPage;

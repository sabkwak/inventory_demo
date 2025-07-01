"use client";

import { GetProductsStatsResponseType } from "@/app/api/stats/products/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateToUTCDate} from "@/lib/helpers";
import { TransactionType } from "@/lib/types";
import { UserSettings } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";

interface Props {
  userSettings: UserSettings;
  from: Date;
  to: Date;
}

function ProductsStats({ userSettings, from, to }: Props) {
  const statsQuery = useQuery<GetProductsStatsResponseType>({
    queryKey: ["overview", "stats", "products", from, to],
    queryFn: () =>
      fetch(
        `/api/stats/products?from=${DateToUTCDate(from)}&to=${DateToUTCDate(
          to
        )}`
      ).then((res) => res.json()),
  });

  // const formatter = useMemo(() => {
  //   return GetFormatterForWeight(userSettings.weight);
  // }, [userSettings.weight]);

  return (
    <div className="flex w-full flex-wrap gap-2 md:flex-nowrap">
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <ProductsCard
          // formatter={formatter}
          type="subtract"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
      <SkeletonWrapper isLoading={statsQuery.isFetching}>
        <ProductsCard
          // formatter={formatter}
          type="add"
          data={statsQuery.data || []}
        />
      </SkeletonWrapper>
    </div>
  );
}

export default ProductsStats;

function ProductsCard({
  data,
  type,
  // formatter,
}: {
  type: TransactionType;
  // formatter: Intl.NumberFormat;
  data: GetProductsStatsResponseType;
}) {
  // For statistics, group "sold" and "waste" with "subtract" since they all reduce inventory
  const isSubtractType = type === "subtract" || type === "sold" || type === "waste";
  const filteredData = data.filter((el) => {
    if (isSubtractType) {
      return el.type === "subtract" || el.type === "sold" || el.type === "waste";
    }
    return el.type === type;
  });
  
  const total = filteredData.reduce(
    (acc, el) => acc + (el._sum?.amount || 0),
    0
  );

  const getTypeLabel = (type: TransactionType) => {
    if (isSubtractType) {
      return "Subtract (Sold/Waste)";
    }
    return type === "add" ? "Add" : type;
  };

  return (
    <Card className="h-80 w-full col-span-6">
      <CardHeader>
        <CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
          {getTypeLabel(type)} by brand
        </CardTitle>
      </CardHeader>

      <div className="flex items-center justify-between gap-2">
        {filteredData.length === 0 && (
          <div className="flex h-60 w-full flex-col items-center justify-center">
            No data for the selected period
            <p className="text-sm text-muted-foreground">
              Try selecting a different period or try adding new{" "}
              {getTypeLabel(type)}
            </p>
          </div>
        )}

        {filteredData.length > 0 && (
          <ScrollArea className="h-60 w-full px-4">
            <div className="flex w-full flex-col gap-4 p-4">
              {filteredData.map((item) => {
                const amount = item._sum.amount || 0;
                const percentage = (amount * 100) / (total || amount);

                return (
                  <div key={item.productId} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-400">
                       {item.productName || `Product ${item.productId}`}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </span>

                      <span className="text-sm text-gray-400">
{amount}                      </span>
                    </div>

                    <Progress
                      value={percentage}
                      indicator={
                        isSubtractType ? "bg-emerald-500" : "bg-red-500"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
}

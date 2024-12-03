"use client";

import CreateUnitDialog from "@/app/(dashboard)/_components/CreateUnitDialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Unit } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
interface Props {
  onChange: (value: string) => void;
  defaultProductId?: number; // Product ID to fetch the associated unit
}

function UnitRetriever({ defaultProductId, onChange }: Props) {
  const [unitName, setUnitName] = useState<string | null>(null);

  // Fetch the ingredient by defaultProductId
  const ingredientQuery = useQuery({
    queryKey: ["ingredient", defaultProductId],
    queryFn: async () => {
      if (!defaultProductId) return null;
      const res = await fetch(`/api/ingredient?id=${defaultProductId}`);
      if (!res.ok) throw new Error("Failed to fetch ingredient");
      return res.json();
    },
    enabled: !!defaultProductId, // Only fetch if defaultProductId exists
  });

  useEffect(() => {
    if (ingredientQuery.data?.unit?.name) {
      setUnitName(ingredientQuery.data.unit.name); // Extract the unit name
      onChange(ingredientQuery.data.unit.name); // Trigger the callback with the unit name
    }
  }, [ingredientQuery.data, onChange]);

  if (ingredientQuery.isLoading) return <div>Loading...</div>;
  if (ingredientQuery.isError) return <div>Error fetching ingredient</div>;

  return <span>({unitName || ""})</span>;
}

export default UnitRetriever;

function UnitRow({ unit }: { unit: Unit }) {
  return (
    <div className="flex items-center gap-2">
      <span>{unit.name}</span>
    </div>
  );
}

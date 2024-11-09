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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Unit } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface Props {
  onChange: (value: string) => void;
  unitName: string; // Add this line

}

function UnitPicker({  onChange, unitName }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (!value) return;
    // when the value changes, call onChange callback
    onChange(value);
  }, [onChange, value]);

  const unitsQuery = useQuery({
    queryKey: ["units"],
    queryFn: () =>
      fetch(`/api/units`).then((res) => res.json()),
  });

  // Ensure unitsQuery.data is an array
  const units = Array.isArray(unitsQuery.data) ? unitsQuery.data : [];

  const selectedUnit = units.find(
    (unit: Unit) => unit.name === value
  );

  const successCallback = useCallback(
    (unit: Unit) => {
      setValue(unit.name);
      setOpen((prev) => !prev);
    },
    [setValue, setOpen]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedUnit ? (
            <UnitRow unit={selectedUnit} />
          ) : (
            "Select unit"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="Search unit..." />
          <CreateUnitDialog  successCallback={successCallback} />
          <CommandEmpty>
            <p>Unit not found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Create a new unit
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {units.map((unit: Unit) => (
                <CommandItem
                  key={unit.name}
                  onSelect={() => {
                    setValue(unit.name);
                    setOpen((prev) => !prev);
                  }}
                >
                  <UnitRow unit={unit} />
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4 opacity-0",
                      value === unit.name && "opacity-100"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default UnitPicker;

function UnitRow({ unit }: { unit: Unit }) {
  return (
    <div className="flex items-center gap-2">
      {/* <span role="img">{unit.icon}</span> */}
      <span>{unit.name}</span>
    </div>
  );
}
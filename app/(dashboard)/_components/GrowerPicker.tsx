"use client";

import CreateGrowerDialog from "@/app/(dashboard)/_components/CreateGrowerDialog";
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
import { Grower } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface Props {
  onChange: (value: string) => void;
  growerName: string;
}

function GrowerPicker({  onChange, growerName }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (!value) return;
    // when the value changes, call onChange callback
    onChange(value);
  }, [onChange, value]);

  const growersQuery = useQuery({
    queryKey: ["growers"],
    queryFn: () =>
      fetch(`/api/growers`).then((res) => res.json()),
  });

  // Ensure growersQuery.data is an array
  const growers = Array.isArray(growersQuery.data) ? growersQuery.data : [];

  const selectedGrower = growers.find(
    (grower: Grower) => grower.name === value
  );

  const successCallback = useCallback(
    (grower: Grower) => {
      setValue(grower.name);
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
          {selectedGrower ? (
            <GrowerRow grower={selectedGrower} />
          ) : (
            "Select grower"
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
          <CommandInput placeholder="Search grower..." />
          <CreateGrowerDialog successCallback={successCallback} />
          <CommandEmpty>
            <p>Grower not found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Create a new grower
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {growers.map((grower: Grower) => (
                <CommandItem
                  key={grower.name}
                  onSelect={() => {
                    setValue(grower.name);
                    setOpen((prev) => !prev);
                  }}
                >
                  <GrowerRow grower={grower} />
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4 opacity-0",
                      value === grower.name && "opacity-100"
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

export default GrowerPicker;

function GrowerRow({ grower }: { grower: Grower }) {
  return (
    <div className="flex items-center gap-2">
      {/* <span role="img">{grower.icon}</span> */}
      <span>{grower.name}</span>
    </div>
  );
}
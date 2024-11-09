"use client";

import CreateBrandDialog from "@/app/(dashboard)/_components/CreateBrandDialog";
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
import { Brand } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface Props {
  onChange: (value: string) => void;
  brandName: string;
}

function BrandPicker({  onChange, brandName }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (!value) return;
    // when the value changes, call onChange callback
    onChange(value);
  }, [onChange, value]);

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: () =>
      fetch(`/api/brands`).then((res) => res.json()),
  });

  // Ensure brandsQuery.data is an array
  const brands = Array.isArray(brandsQuery.data) ? brandsQuery.data : [];

  const selectedBrand = brands.find(
    (brand: Brand) => brand.name === value
  );

  const successCallback = useCallback(
    (brand: Brand) => {
      setValue(brand.name);
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
          {selectedBrand ? (
            <BrandRow brand={selectedBrand} />
          ) : (
            "Select brand"
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
          <CommandInput placeholder="Search brand..." />
          <CreateBrandDialog successCallback={successCallback} />
          <CommandEmpty>
            <p>Brand not found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Create a new brand
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {brands.map((brand: Brand) => (
                <CommandItem
                  key={brand.name}
                  onSelect={() => {
                    setValue(brand.name);
                    setOpen((prev) => !prev);
                  }}
                >
                  <BrandRow brand={brand} />
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4 opacity-0",
                      value === brand.name && "opacity-100"
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

export default BrandPicker;

function BrandRow({ brand }: { brand: Brand }) {
  return (
    <div className="flex items-center gap-2">
      {/* <span role="img">{brand.icon}</span> */}
      <span>{brand.name}</span>
    </div>
  );
}
"use client";

import CreateProductDialog from "@/app/(dashboard)/_components/CreateProductDialog";
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
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Product } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  onChange: (value: number) => void; // Pass only the productId
  defaultProductId?: number; // Optional default product ID
}

function ProductPicker({ onChange, defaultProductId }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<{ productId: number; brandId: number } | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(`/api/products`).then((res) => res.json()),
  });

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: () => fetch(`/api/brands`).then((res) => res.json()),
  });

  const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const brands = Array.isArray(brandsQuery.data) ? brandsQuery.data : [];

  useEffect(() => {
    if (defaultProductId && products.length > 0) {
      const defaultProduct = products.find((product: Product) => product.id === defaultProductId);
      if (defaultProduct) {
        setValue({ productId: defaultProduct.id, brandId: defaultProduct.brandId });
        onChange(defaultProduct.id); // Trigger onChange with the default product ID
      }
    }
  }, [defaultProductId, products, onChange]);

  useEffect(() => {
    if (value) {
      onChange(value.productId); // Pass only productId to onChange
    }
  }, [value, onChange]);

  const successCallback = useCallback(
    (product: Product) => {
      setValue({ productId: product.id, brandId: product.brandId });
      setOpen(false);
    },
    []
  );

  if (brandsQuery.isLoading || productsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (brandsQuery.isError || productsQuery.isError) {
    return (
      <div>Error: {brandsQuery.error ? (brandsQuery.error as Error).message : (productsQuery.error as Error).message}</div>
    );
  }

  const selectedProduct = products.find(
    (product: Product) => product.id === value?.productId && product.brandId === value?.brandId
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
          {selectedProduct ? (
            <ProductRow product={selectedProduct} brands={brands} />
          ) : (
            "Select ingredient"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command onSubmit={(e) => e.preventDefault()}>
          <CommandInput placeholder="Search product..." />
          <CreateProductDialog successCallback={successCallback} trigger={undefined} />
          <CommandEmpty>
            <p>Ingredient not found</p>
            <p className="text-xs text-muted-foreground">Tip: Create a new ingredient</p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {products.map((product: Product) => (
                <CommandItem
                  key={`${product.id}-${product.brandId}`} // Simplified key
                  onSelect={() => {
                    setValue({ productId: product.id, brandId: product.brandId });
                    setOpen(false); // Close only the ProductPicker, not the entire dialog
                  }}
                >
                  <ProductRow product={product} brands={brands} />
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4 opacity-0",
                      value?.productId === product.id && value?.brandId === product.brandId && "opacity-100"
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

export default ProductPicker;

function ProductRow({
  product,
  brands,
}: {
  product: Product;
  brands: any[];
}) {
  const brandName = brands.find(
    (brand) => brand.id === product.brandId
  )?.name;

  return (
    <div className="flex items-center gap-2">
      <span>{product.product}</span>
      <span> - {brandName}</span>
    </div>
  );
}

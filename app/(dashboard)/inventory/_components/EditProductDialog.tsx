"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Product } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import BrandPicker from "@/app/(dashboard)/_components/BrandPicker";
import CategoryPicker from "@/app/(dashboard)/_components/CategoryPicker";
import UnitPicker from "@/app/(dashboard)/_components/UnitPicker";

import {
  EditProductSchema,
  EditProductSchemaType,
} from "@/schema/product";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditProduct } from "@/app/(dashboard)/inventory/_actions/editProduct";

interface Props {
  trigger: ReactNode;
  successCallback: (product: Product) => void;

  product: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    product: string;
    brandId: number;
    categoryId: number | null;
    unitId: number | null;
    quantity: number | 0;
    value: number | 0;
    description: string | null;
  };
  productId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

function EditProductDialog({ productId, trigger, successCallback, product, open, setOpen }: Props) {
  const [showPicker, setShowPicker] = useState(false); 
  const [showCategoryPicker, setShowCategoryPicker] = useState(false); 

  const [categoryName, setCategoryName] = useState<string>("");
  const [showUnitPicker, setShowUnitPicker] = useState(false); 

  const [unitName, setUnitName] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  // const [open, setOpen] = useState(false);



  const form = useForm<EditProductSchemaType>({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      id: product.id,
      product: product.product,
      quantity: product.quantity || 0,
      value: product.value || 0,
      brand: brandName,
      category: categoryName,
      unit: unitName,

      description: product.description || "",
      createdAt: new Date(product.createdAt),
    },
  });

  const queryClient = useQueryClient();
  useEffect(() => {
    async function fetchCategoryAndBrand() {
      try {
        const categoryResponse = await fetch(`/api/categories?id=${product.categoryId}`);
        const categoryData = await categoryResponse.json();
        const unitResponse = await fetch(`/api/categories?id=${product.unitId}`);
        const unitData = await unitResponse.json();
        const brandResponse = await fetch(`/api/brands?id=${product.brandId}`);
        const brandData = await brandResponse.json();

        if (unitResponse.ok) {
          setUnitName(unitData.name);
        }
        
        if (categoryResponse.ok) {
          setCategoryName(categoryData.name);
        }


        if (brandResponse.ok) {
          setBrandName(brandData.name);
        }
      } catch (error) {
        toast.error("Failed to fetch unit, category or brand information.");
      }
    }

    if (open) {
      fetchCategoryAndBrand();
    }
  }, [open, product.categoryId, product.brandId, product.unitId]);

  const { mutate, isPending } = useMutation({
    mutationFn: EditProduct,
    onSuccess: async (data: Product) => {
      form.reset({
        id: product.id,
        description: "",
createdAt: new Date(),
quantity: 0,
value: 0,
        // icon: "",
        // ingredient: undefined,
        brand: undefined,
        category: undefined,
        unit: undefined,

      });

      toast.success(`Ingredient ${data.product} edited successfully 🎉`, {
        id: productId,
      });

      successCallback(data);

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      setOpen(false); // Close the dialog after success
      // setOpen((prev) => !prev);
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "edit-product",
      });
    },
  });

  const onSubmit = useCallback(
    (values: EditProductSchemaType) => {
      toast.loading("Editing ingredient...", {
        id: productId,
      });
      mutate({
        id: productId,
        data: {
          product: values.product,
          id: values.id,
          quantity: values.quantity,
          value: values.value,
          createdAt: values.createdAt,
          brand: values.brand,
          description: values.description,
          category: values.category, // Convert category to ID if present
          unit: values.unit, // Convert category to ID if present

        },
      });    },
    [mutate, productId]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={"ghost"}
            className="flex items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
          >
            Edit Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">Name (required)</FormLabel>
                    <FormControl>
                      <Input placeholder="Product" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="block">Brand (required)</FormLabel>
                    <FormControl>
                      <BrandPicker brandName={brandName} onChange={(value) => { form.setValue("brand", value); setBrandName(value); }} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? 0}
                        type="number"
                        placeholder="Enter product quantity"
                        min={0}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">Unit</FormLabel>
                    <FormControl>
                      <UnitPicker unitName={unitName} onChange={(value) => { form.setValue("unit", value); setUnitName(value); }} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block">Cost of Production ($)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? undefined}
                        type="number"
                        placeholder="Enter cost price"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceType"
                render={({ field }) => {
                  const priceValue = form.watch('value');
                  return (
                    <FormItem hidden={!priceValue}>
                      <FormLabel>Price Type</FormLabel>
                      <FormControl>
                        <select {...field}>
                          <option value="">Select price type</option>
                          <option value="unit">Unit price</option>
                          <option value="total">Total price</option>
                        </select>
                      </FormControl>
                      <FormMessage>Please specify price-type</FormMessage>
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="selling_price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price/Unit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Selling price per unit"
                        min={0}
                        step="0.01"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Minimum stock"
                        min={0}
                        step="0.01"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[200px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(value) => {
                            if (!value) return;
                            field.onChange(value);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Optional expiry date</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryPicker categoryName={categoryName} onChange={(value) => { form.setValue("category", value); setCategoryName(value); }} />
                  </FormControl>
                  <FormDescription>
                    Select a category for this Product
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description/Notes</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Product description/notes
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Added</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[200px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(value) => {
                          if (!value) return;
                          field.onChange(value);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Date product was added</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant={"secondary"}
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
              >
                {!isPending && "Save"}
                {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditProductDialog;
"use client";
import { useWatch } from 'react-hook-form';

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import IngredientPicker from "@/app/(dashboard)/_components/IngredientPicker";
import BrandPicker from "@/app/(dashboard)/_components/BrandPicker";
import CategoryPicker from "@/app/(dashboard)/_components/CategoryPicker";
import UnitPicker from "@/app/(dashboard)/_components/UnitPicker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateProductSchema,
  CreateProductSchemaType,
} from "@/schema/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import React, { ReactNode, useCallback, useState } from "react";
import { useForm, FormState } from "react-hook-form";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProduct } from "@/app/(dashboard)/_actions/new-products";
import { Product } from "@prisma/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import * as z from "zod";
import { UserSettings } from "@prisma/client";

interface Props {
  trigger: ReactNode;
  successCallback: (product: Product) => void;
  userSettings: UserSettings;

}

async function fetchUserSettings() {
  const res = await fetch("/api/user-settings"); // Call your API route
  if (!res.ok) throw new Error("Failed to fetch user settings");
  return res.json();
}

function CreateProductDialog({ trigger, successCallback }: Props) {
  const form = useForm<CreateProductSchemaType>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      createdAt: new Date(),
    },
  });

  const [open, setOpen] = useState(false);

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["userSettings"], // Query key
    queryFn: fetchUserSettings, // Query function
  });

  const handleProductChange = useCallback(
    (value: string) => {
      form.setValue("product", value);
    },
    [form]
  );

  // const handleIngredientChange = useCallback(
  //   (value: string) => {
  //     form.setValue("ingredient", value);
  //   },
  //   [form]
  // );

  const handleBrandChange = useCallback(
    (value: string) => {
      form.setValue("brand", value);
    },
    [form]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue("category", value);
    },
    [form]
  );
  const handleUnitChange = useCallback(
    (value: string) => {
      form.setValue("unit", value);
    },
    [form]
  );
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { register, handleSubmit, formState } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateProduct,
    onSuccess: async (data: Product) => {
      console.log('Form data:', data);
      console.log('Validation errors:', formState.errors);
      form.reset({
        product: "",
        description: "",
        value: undefined,
        quantity: 0,
        brand: undefined,
        category: undefined,        
        unit: undefined,

      });

      toast.success(`Ingredient ${data.product} created successfully 🎉`, {
        id: "create-product",
      });

      successCallback(data);

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      setOpen((prev) => !prev);
         // Force a page reload
    window.location.reload();
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: "create-product",
      });
    },
  });

  const onSubmit = useCallback(
    (values: CreateProductSchemaType) => {
      toast.loading("Creating ingredient...", {
        id: "create-product",
      });
      mutate(values);
    },
    [mutate]
  );

  // If loading user settings, show a loading state (optional)
  if (isLoading) {
    return <div>Loading user settings...</div>;
  }

  // Destructure the weight defaultUnit from userSettings
  const weightDefaultUnit = userSettings?.weight || "g"; // Default to grams if not available

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant={"ghost"}
            className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Create new
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create
            <span className={cn("m-1", "text-emerald-500")}></span>
            new Ingredient
          </DialogTitle>
          <DialogDescription>
            Name a new Ingredient and assign a brand and unit
          </DialogDescription>
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
                    <Input placeholder="Ingredient" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    This is how your ingredient will appear in the app (required)
                  </FormDescription> */}
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
                    <BrandPicker brandName="" onChange={handleBrandChange} />
                  </FormControl>
                  {/* <FormDescription>
                    Select a brand for this Ingredient (required)
                  </FormDescription> */}
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
            value={field.value ?? 0} // Ensure default value is 0
            type="number"
            placeholder="Enter product quantity"
            min={0} // Prevent negative values
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
          <UnitPicker unitName="" onChange={handleUnitChange} />
        </FormControl>
        {/* <FormDescription>
          Select a unit for this Ingredient
        </FormDescription> */}
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
  min={undefined} // Add this line
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceType"
              render={({ field }) => {
                const priceValue = useWatch({
                  control: form.control,
                  name: 'value',
                });
            
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
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <CategoryPicker categoryName="" onChange={handleCategoryChange} />
                  </FormControl>
                  <FormDescription>
                    Select a category for this Ingredient
                  </FormDescription>
                </FormItem>
              )}
            />


            </div>
                                    <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description/Notes</FormLabel>
                  <FormControl>
                  <Input
          {...field}   // Spread field but override `value` within it
          value={field.value ?? ""}  // Coerce `null` to an empty string
        />
          </FormControl>
                  <FormDescription>
                    New ingredient description/notes
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
                    <FormDescription>Select a date for this</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant={"secondary"}
              onClick={() => {
                form.reset();
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {!isPending && "Create"}
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateProductDialog;
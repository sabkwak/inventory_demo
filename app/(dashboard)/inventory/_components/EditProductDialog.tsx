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
import GrowerPicker from "@/app/(dashboard)/_components/GrowerPicker";
import CategoryPicker from "@/app/(dashboard)/_components/CategoryPicker";
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
    growerId: number;
    categoryId: number | null;
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
  const [growerName, setGrowerName] = useState<string>("");
  // const [open, setOpen] = useState(false);



  const form = useForm<EditProductSchemaType>({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      id: product.id,
      product: product.product,
      quantity: product.quantity || 0,
      value: product.value || 0,
      grower: growerName,
      category: categoryName,
      description: product.description || "",
      createdAt: new Date(product.createdAt),
    },
  });

  const queryClient = useQueryClient();
  useEffect(() => {
    async function fetchCategoryAndGrower() {
      try {
        const categoryResponse = await fetch(`/api/categories?id=${product.categoryId}`);
        const categoryData = await categoryResponse.json();

        const growerResponse = await fetch(`/api/growers?id=${product.growerId}`);
        const growerData = await growerResponse.json();

        if (categoryResponse.ok) {
          setCategoryName(categoryData.name);
        }

        if (growerResponse.ok) {
          setGrowerName(growerData.name);
        }
      } catch (error) {
        toast.error("Failed to fetch category or grower information.");
      }
    }

    if (open) {
      fetchCategoryAndGrower();
    }
  }, [open, product.categoryId, product.growerId]);

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
        grower: undefined,
        category: undefined,
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
          grower: values.grower,
          description: values.description,
          category: values.category, // Convert category to ID if present
        },
      });    },
    [mutate]
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
          <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ingredient name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
                        <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value ($)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={Number(field.value) ?? undefined}
                      type="value"
                      placeholder="Enter product value"
                    />
                  </FormControl>
                  <FormDescription>Click to adjust the total item value in the inventory</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={Number(field.value) ?? 0}
                      type="number"
                      placeholder="Enter product quantity"
                    />
                  </FormControl>
                  <FormDescription>Click to adjust the total item quantity in the inventory</FormDescription>
                </FormItem>
              )}
            />
 <FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Category</FormLabel>
      <FormControl>
        {!showCategoryPicker ? (
        <Input
          {...field} // Connects the input field to react-hook-form
          value={field.value || categoryName} // Displays the fetched growerName
          onFocus={() => setShowCategoryPicker(true)} // Show picker on input focus
          placeholder="Enter category name"
        />
      ) : (
        <CategoryPicker
          categoryName={categoryName} // Pass the current grower name
          onChange={(value: string) => {
            field.onChange(value); // Update form value
            setShowCategoryPicker(false); // Hide picker once a value is selected
          }}
        />
      )}
      </FormControl>
      <FormDescription>*Warning Selecting this box will reset the category for this item</FormDescription>
    </FormItem>
  )}
/> 
<FormField
  control={form.control}
  name="grower"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Grower</FormLabel>
      <FormControl>
        {!showPicker ? (
        <Input
          {...field} // Connects the input field to react-hook-form
          value={field.value || growerName} // Displays the fetched growerName
          onFocus={() => setShowPicker(true)} // Show picker on input focus
          placeholder="Enter grower name"
        />
      ) : (
        <GrowerPicker
          growerName={growerName} // Pass the current grower name
          onChange={(value: string) => {
            field.onChange(value); // Update form value
            setShowPicker(false); // Hide picker once a value is selected
          }}
        />
      )}
      </FormControl>
      <FormDescription>*Warning* You will have to re-enter if you click Category or Grower</FormDescription>
    </FormItem>
  )}
/> 
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Enter description"
                    />
                  </FormControl>
                  <FormDescription>(optional)</FormDescription>
                </FormItem>
              )}
            />
            { <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(value) => value && field.onChange(value)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select a date for this item</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> }
            <DialogFooter>
              <Button
                type="button"
                variant={"secondary"}
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
              {!isPending && "Edit"}
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
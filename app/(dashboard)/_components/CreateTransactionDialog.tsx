"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { ReactNode, useCallback, useState } from "react";
import { useQuery } from '@tanstack/react-query';  // Import the useQuery hook for fetching product data

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import ClientPicker from "@/app/(dashboard)/_components/ClientPicker";
import ProductPicker from "@/app/(dashboard)/_components/ProductPicker";
import UnitRetriever from "@/app/(dashboard)/_components/UnitRetriever";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "@/app/(dashboard)/_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import {  useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserSettings } from "@prisma/client";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
  defaultProductId?: number; // Add defaultProductId prop
  userSettings: UserSettings;

}
async function fetchUserSettings() {
  const res = await fetch("/api/user-settings"); // Call your API route
  if (!res.ok) throw new Error("Failed to fetch user settings");
  return res.json();
}
function CreateTransactionDialog({ trigger, type, defaultProductId }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const userQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(`/api/products`).then((res) => res.json()),
  });
  const user = userQuery.data;
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
      // client: undefined, // Initialize with undefined or null
      productId: defaultProductId || undefined, // Initialize with undefined or null
    },
  });


  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { data, error } = useQuery({
    queryKey: ['product', form.getValues('productId')],
    queryFn: async () => {
      const productResponse = await fetch(`/api/product?id=${form.getValues('productId')}`);
      const product = await productResponse.json();
  
      const unitResponse = await fetch(`/api/product?id=${form.getValues('productId')}`);
      const ingredient = await unitResponse.json();
  
      return { product, unit: ingredient?.unit?.name || null };
    },
    enabled: !!form.getValues('productId'),
  });
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["userSettings"], // Query key
    queryFn: fetchUserSettings, // Query function
  });
  
  useEffect(() => {
    if (data) {
      console.log('Product fetched:', data);  // Debugging log
    }
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transaction created successfully 🎉", {
        id: "create-transaction",
      });

      form.reset({
        productId: defaultProductId || undefined,
        price: undefined,
        type,
        description: "",
        amount: 0,
        date: new Date(),
      });

      // After creating a transaction, invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ["overview"],
      });

      setOpenDialog((prev) => !prev);
    },
    onError: (error: any) => {
      // Dismiss the loading toast
      toast.dismiss("create-transaction");

      // Catch any error thrown from the server (including negative inventory)
      toast.error(error?.message || "An error occurred during the transaction.");
    },
  });



  const fetchInventory = async (productId: number): Promise<number> => {
    // Replace with actual API call to fetch inventory
    // Example:
    // const response = await fetch(`/api/inventory?productId=${productId}`);
    // const data = await response.json();
    // return data.inventory;
    return 10; // Mocked inventory value for demonstration
  };

  const handleSubmit = useCallback(
    async (values: CreateTransactionSchemaType) => {
      try {
        // Fetch current inventory
        const inventory = await fetchInventory(values.productId);
  
        // Check if inventory is sufficient
        if (inventory <= 0) {
          toast.error("Too few items in inventory.");
          return;
        }
  
        // Show loading toast
        const toastId = toast.loading("Creating transaction...", { id: "create-transaction" });
  
        // Proceed with transaction creation
        mutate({
          ...values,
          date: DateToUTCDate(values.date),
        });
  
      } catch (error) {
        // Dismiss the loading toast
        toast.dismiss("create-transaction");
  
        // Show error toast
        toast.error("An error occurred during the transaction.");
        console.error("Error submitting transaction:", error);
      }
    },
    [mutate]
  );

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
         
            <span
              className={cn(
                "m-1",
                type === "subtract" ? "text-red-500":"text-emerald-500",     "capitalize"

              )}
            >
              {type}
            </span> Ingredient
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ingredient</FormLabel>
                  <FormControl>
                  <ProductPicker userSettings={user}
  defaultProductId={defaultProductId}
  onChange={(productId: number) => form.setValue("productId", productId)}
/>
                    </FormControl>
                  <FormDescription>Select a ingredient for this transaction (required)</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? undefined} // Ensure default value is 0
                      type="number"
                      placeholder="Enter transaction price"
                      min={0} // Prevent negative values
                    />
                  </FormControl>
                </FormItem>
              )}
            />
  {/* Amount field with dynamic unit */}
     
  <FormField
  control={form.control}
  name="amount"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Amount <UnitRetriever
  defaultProductId={defaultProductId}
  onChange={(unitName) => console.log("Selected unit:", unitName)}
/></FormLabel>
      <div className="flex items-center gap-2">
        <Input {...field} type="number" placeholder="Enter amount" />
     

      </div>
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
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>
                    Transaction description/notes (optional)
                  </FormDescription>
                </FormItem>
              )}
            />
                          <FormField
                control={form.control}
                name="date"
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
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isPending}
          >
            {!isPending && "Create"}
            {isPending && <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;
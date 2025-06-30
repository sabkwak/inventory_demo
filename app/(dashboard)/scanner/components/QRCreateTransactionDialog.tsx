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
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";

import { ReactNode, useCallback, useState } from "react";
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
import ProductPicker from "@/app/(dashboard)/_components/ProductPicker";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "@/app/(dashboard)/_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

function QRCreateTransactionDialog({ trigger, type }: Props) {
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
      productId: undefined, // Initialize with undefined or null
    },
  });
  const userQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(`/api/products/user`).then((res) => res.json()),
  });
  const user = userQuery.data;
  const [openDialog, setOpenDialog] = useState(false); // Separate state for the dialog

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transaction created successfully 🎉", {
        id: "create-transaction",
      });

      form.reset({
        productId: undefined,
        cost: undefined,
        sellPrice: undefined,
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
          toast.error("Inventory is insufficient. No more orders can be placed for this ingredient and brand.");
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

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case "add":
        return "text-emerald-500";
      case "subtract":
        return "text-red-500";
      case "sold":
        return "text-blue-500";
      case "waste":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const getTypeLabel = (type: TransactionType) => {
    switch (type) {
      case "add":
        return "Add";
      case "subtract":
        return "Subtract";
      case "sold":
        return "Sold";
      case "waste":
        return "Waste";
      default:
        return type;
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create a new
            <span
              className={cn(
                "m-1 capitalize",
                getTypeColor(type)
              )}
            >
              {getTypeLabel(type)}
            </span>
            transaction
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
                    <ProductPicker userSettings={user} onChange={(productId: number) => form.setValue("productId", productId)} />
                  </FormControl>
                  <FormDescription>Select a ingredient for this transaction (required)</FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Production Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter production cost"
                      min={0}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Enter selling price"
                      min={0}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input defaultValue={0} type="number" {...field} />
                  </FormControl>
                  <FormDescription>Transaction amount (required)</FormDescription>
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

export default QRCreateTransactionDialog;
"use client";

import { fetchTransactionById } from "@/lib/helpers"; // Adjust your import
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
import { Transaction } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "@/app/(dashboard)/_components/CategoryPicker";
import {
  EditTransactionSchema,
  EditTransactionSchemaType,
} from "@/schema/transaction";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { EditTransaction } from "@/app/(dashboard)/transactions/_actions/editTransaction";
import ProductPicker from "@/app/(dashboard)/_components/ProductPicker";
import UnitRetriever from "@/app/(dashboard)/_components/UnitRetriever";

interface Props {
    trigger: ReactNode;
    successCallback: (transaction: Transaction) => void;
    transactionId: number;
transaction: {
    id: number;
    amount: number;
    cost: number;
    sellPrice: number;
    date: Date;
    description: string | null;
    type: string;
}

    open: boolean;
    setOpen: (open: boolean) => void;
  }
  function EditTransactionDialog({ open, setOpen, transactionId, transaction, trigger, successCallback}: Props) {
    const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState<number>(0);
    const [transactionDescription, setTransactionDescription] = useState<string>("");

    const [showPicker, setShowPicker] = useState(false); 

    // React Hook Form setup with Zod validation
    const form = useForm<EditTransactionSchemaType>({
        resolver: zodResolver(EditTransactionSchema),
        defaultValues: {
            id: transaction.id,
            amount: transaction.amount,
            cost: transaction.cost || undefined,
            sellPrice: transaction.sellPrice || undefined,
            description: transaction.description || "",
            date: new Date(),
            type: transaction.type === "subtract" || transaction.type === "add" ? transaction.type : "subtract",
        },
    });
    const queryClient = useQueryClient();
    useEffect(() => {
        async function fetchTransaction() {
          try {

            const transactionResponse = await fetch(`/api/transactions?id=${transaction.id}`);
            const transactionData = await transactionResponse.json();
    

            if (transactionResponse.ok) {
            setTransactionAmount(transactionData.amount);          
            setTransactionDescription(transactionData.description)            }
                      } 
          catch (error) {
            toast.error("Failed to fetch transaction information.");
          }
        }
    
        if (open) {
          fetchTransaction();
        }
      }, [open, transaction.id, transaction.amount, transaction.description]);

    const { mutate, isPending } = useMutation({
        mutationFn: EditTransaction,
        onSuccess: async (data: Transaction) => {
            form.reset({
                id: transaction.id,
                description: "",
        date: new Date(),
        amount: 0,
        cost: undefined,
        sellPrice: undefined,
              });
              toast.success(`Transaction ${data.id} edited successfully 🎉`, {
                id: transactionId,
              });
                    successCallback(data); // Execute the callback after success
           await queryClient.invalidateQueries({ 
            queryKey: ["transactions"],
        });
            setOpen(false); // Close dialog after success
        },
        onError: () => {
            toast.error("Failed to edit the transaction");
        },
    });

    const onSubmit = useCallback(
        (values: EditTransactionSchemaType) => {
          toast.loading("Editing transaction...", {
            id: transactionId,
          });
          mutate({
            id: transactionId,
            data: {
              id: values.id,
              amount: values.amount,
              cost: values.cost,
              sellPrice: values.sellPrice,
              date: values.date,
              description: values.description,
              type: values.type, // Convert category to ID if present
            },
          });    },
        [mutate, transactionId]
      );

    return (
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    {trigger ? (
      trigger
    ) : (
      <Button
        variant={"ghost"}
        className="flex items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
      >
        Edit Transaction
      </Button>
    )}
  </DialogTrigger>           
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Transaction</DialogTitle>
      <DialogDescription>Update transaction details</DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Product</FormLabel>
              <FormControl>
                <ProductPicker userSettings={undefined} // You may want to pass userSettings if available
                  defaultProductId={transaction.id}
                  onChange={(productId: number) => form.setValue("productId", productId)}
                />
              </FormControl>
              <FormDescription>Select a product for this transaction (required)</FormDescription>
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
          {(form.getValues('type') === "add" || form.getValues('type') === "sold" || form.getValues('type') === "subtract") && (
            <FormField
              control={form.control}
              name={form.getValues('type') === "add" ? "cost" : "sellPrice"}
              render={({ field }) => (
                <FormItem>
                  {form.getValues('type') === "add" ? (
                    <FormLabel>Production Cost ($)</FormLabel>
                  ) : (
                    <FormLabel>Selling Price ($)</FormLabel>
                  )}
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value !== undefined && field.value !== null ? field.value : ""}
                      type="number"
                      placeholder={form.getValues('type') === "add" ? "Enter cost" : "Enter selling price"}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity <UnitRetriever
                  defaultProductId={transaction.id}
                  onChange={(unitName) => console.log("Selected unit:", unitName)}
                /></FormLabel>
                <div className="flex items-center gap-2">
                  <Input {...field} type="number" placeholder="Enter amount" />
                </div>
              </FormItem>
            )}
          />
        </div>
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

export default EditTransactionDialog;

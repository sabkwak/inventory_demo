"use client";
import { useWatch } from 'react-hook-form';

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
import { ReactNode, useCallback, useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';  // Import the useQuery hook for fetching product data

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { useRouter } from "next/navigation";
import { UserSettings } from "@prisma/client";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
  defaultProductId?: number; // Add defaultProductId prop
  userSettings: UserSettings;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  selectedBatches?: any[]; // New prop for batch selection
}
async function fetchUserSettings() {
  const res = await fetch("/api/user-settings"); // Call your API route
  if (!res.ok) throw new Error("Failed to fetch user settings");
  return res.json();
}
function CreateTransactionDialog({ trigger, type, defaultProductId, open, setOpen, selectedBatches = [] }: Props) {
  const [internalOpenDialog, setInternalOpenDialog] = useState(false);
  const openDialog = open !== undefined ? open : internalOpenDialog;
  const setOpenDialog = setOpen || setInternalOpenDialog;
  
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
      productId: defaultProductId || undefined,
      cost: undefined,
      sellPrice: undefined,
      amount: 0,
    },
  });
  const { control, setValue, watch } = form;

  const { fields, update } = useFieldArray({
    control,
    name: "batchRemovals", // this will be an array of { id, removeQty, ... }
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

  // When product changes, set default cost/sellPrice from product
  useEffect(() => {
    if (data && data.product) {
      if (type === "add") {
        form.setValue("cost", data.product.value ?? undefined);
      } else if (type === "sold" || type === "subtract" || type === "waste") {
        form.setValue("sellPrice", data.product.selling_price_per_unit ?? undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, type]);

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success("Transaction created successfully 🎉", {
        id: "create-transaction",
      });

      form.reset({
        productId: defaultProductId || undefined,
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

      setOpenDialog(false);
    },
    onError: (error: any) => {
      // Dismiss the loading toast
      toast.dismiss("create-transaction");

      // Catch any error thrown from the server (including negative inventory)
      toast.error(error?.message || "An error occurred during the transaction.");
    },
  });



  const fetchInventory = async (productId: number): Promise<{ quantity: number; productName: string }> => {
    try {
      const response = await fetch(`/api/product/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product inventory");
      }
      const data = await response.json();
      return {
        quantity: data.quantity || 0,
        productName: data.product || "Unknown Product"
      };
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw new Error("Failed to fetch product inventory");
    }
  };

  const handleSubmit = useCallback(
    async (values: CreateTransactionSchemaType) => {
      try {
        // Only check inventory for subtract-type transactions (sold, subtract, waste)
        const isSubtractType = type === "subtract" || type === "sold" || type === "waste";
        
        if (isSubtractType) {
          // Fetch current inventory
          const inventoryData = await fetchInventory(values.productId);
  
          // Check if inventory is sufficient
          if (inventoryData.quantity <= 0) {
            toast.error(`Cannot ${type.toLowerCase()} "${inventoryData.productName}" - inventory quantity is 0.`);
            return;
          }
          
          // Check if trying to subtract more than available
          if (values.amount > inventoryData.quantity) {
            toast.error(`Cannot ${type.toLowerCase()} ${values.amount} units of "${inventoryData.productName}" - only ${inventoryData.quantity} units available in inventory.`);
            return;
          }
        }
  
        // Show loading toast
        toast.loading("Creating transaction...", { id: "create-transaction" });
  
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
    [mutate, type]
  );

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

  const [batchQuantities, setBatchQuantities] = useState<any[]>(() =>
    selectedBatches.map(batch => ({
      ...batch,
      removeQty: typeof batch.remaining === 'number' ? batch.remaining : 0
    }))
  );

  useEffect(() => {
    if (selectedBatches.length > 0) {
      setValue(
        "batchRemovals",
        selectedBatches.map(batch => ({
          id: batch.id,
          removeQty: batch.remaining,
          ...batch,
        }))
      );
    }
  }, [selectedBatches, setValue]);
  const handleBatchQtyChange = (batchId: number, value: number) => {
    setBatchQuantities(prev => prev.map(b => b.id === batchId ? { ...b, removeQty: value } : b));
  };

  const handleSubmitBatches = async () => {
    // For now, just log the batch breakdown
    // In production, send this to the backend as part of the transaction
    // e.g., { productId, type, batches: batchQuantities.filter(b => b.removeQty > 0) }
    // You may want to call a new backend action for batch transactions
    console.log('Submitting batch sale/waste:', batchQuantities.filter(b => b.removeQty > 0));
    setOpenDialog(false);
    toast.success('Batch sale/waste submitted!');
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span
              className={cn(
                "m-1 capitalize",
                getTypeColor(type)
              )}
            >
              {getTypeLabel(type)}
            </span> Product Quantity
          </DialogTitle>
        </DialogHeader>
        {/* selected batches modal from Inventory Page */}
        <>
        {fields.length > 0 && (type === 'sold' || type === 'waste') && (
          <div className="mb-4">
            <div className="font-semibold mb-2">Selected Batches</div>
            <table className="min-w-full text-sm border">
              <thead>
                <tr>
                  <th>Date Added</th>
                  <th>Original Qty</th>
                  <th>Remaining Qty</th>
                  <th>Remove Qty</th>
                  <th>Cost/Unit</th>
                </tr>
              </thead>
              <tbody>
              {fields.map((batch, idx) => (
          <tr key={batch.id}>
           <td>
  {batch.date
    ? new Date(batch.date).toLocaleDateString()
    : ""}
</td>
            <td>{batch.amount}</td>
            <td>{batch.remaining}</td>
            <td>
              <FormField
                control={control}
                name={`batchRemovals.${idx}.removeQty`}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={batch.remaining}
                    className="w-20"
                  />
                )}
              />
            </td>
            <td>{batch.cost ?? '-'}</td>
          </tr>
        ))}
              </tbody>
            </table>
          </div>
        )}
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>

            <div className="flex space-x-4">

            {(type === "add" || type === "sold" || type === "subtract" || type === "waste") && (
              <FormField
                control={form.control}
                name={type === "add" ? "cost" : "sellPrice"}
                render={({ field }) => (
                  <FormItem>
                    {type === "add" ? (
                      <FormLabel>Production Cost/unit ($)</FormLabel>
                    ) : (
                      <FormLabel>Sell Price/unit ($)</FormLabel>
                    )}
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value !== undefined && field.value !== null ? field.value : ""}
                        type="number"
                        placeholder={type === "add" ? "Enter cost" : "Enter selling price"}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}



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
          </form>
          </Form>
        </>
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
          {selectedBatches.length > 0 && (type === 'sold' || type === 'waste') ? (
            <Button onClick={handleSubmitBatches}>
              Submit Batch Sale/Waste
            </Button>
          ) : (
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isPending}
            >
              {!isPending && "Create"}
              {isPending && <Loader2 className="animate-spin" />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;
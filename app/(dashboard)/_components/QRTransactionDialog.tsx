"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";  // Add this import
import { ReactNode} from "react";

import { zodResolver } from "@hookform/resolvers/zod";  // Add this import
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ProductPicker from "@/app/(dashboard)/_components/ProductPicker";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "@/app/(dashboard)/_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
  defaultProductId?: number;
}

function CreateTransactionDialog({ trigger, type, defaultProductId }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  
  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
      productId: defaultProductId || undefined,
    },
  });

  // Ensure that useRouter only runs on the client
  const router = useRouter();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      queryClient.invalidateQueries({ queryKey: ["overview"] });
      window.location.reload();
      setOpenDialog(false);
    },
    onError: (error: any) => {
      toast.dismiss("create-transaction");
      toast.error(error?.message || "An error occurred during the transaction.");
    },
  });

  const handleSubmit = useCallback(
    async (values: CreateTransactionSchemaType) => {
      mutate({
        ...values,
        date: DateToUTCDate(values.date),
      });
    },
    [mutate]
  );

  const handleBackToInventory = () => {
    if (router) {
      router.push("/inventory");  // Navigate to the /inventory page
    }
  };

  if (!isMounted) {
    return null;  // Render nothing while the component is mounting
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex justify-between">
              <span className={cn("m-1", "capitalize", "text-blue-500")}>
                New Transaction
              </span>
              {/* Close button to navigate back to /inventory */}
              <button
                onClick={handleBackToInventory}
                className="text-xl text-gray-500 hover:text-gray-700"
              >
              </button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Transaction Type Dropdown */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          role="combobox"
                          aria-expanded={false}
                          className="w-[200px] justify-between"
                        >
                          {field.value === "add" ? "Add" : "Subtract"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandList>
                            <CommandItem
                              onSelect={() => field.onChange("add")}
                              className={cn("cursor-pointer")}
                            >
                              <span className="text-green-600 font-medium">Add</span>
                              {field.value === "add" && (
                                <Check className="ml-2 h-4 w-4 text-green-600" />
                              )}
                            </CommandItem>
                            <CommandItem
                              onSelect={() => field.onChange("subtract")}
                              className={cn("cursor-pointer")}
                            >
                              <span className="text-red-600 font-medium">Subtract</span>
                              {field.value === "subtract" && (
                                <Check className="ml-2 h-4 w-4 text-red-600" />
                              )}
                            </CommandItem>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    Choose whether this transaction adds or subtracts ingredients.
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Product Picker */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredient </FormLabel>
                  <FormControl>
                    <ProductPicker
                      defaultProductId={defaultProductId}
                      onChange={(productId: number) =>
                        form.setValue("productId", productId)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Select an ingredient for this transaction (required).
                  </FormDescription>
                </FormItem>
              )}
            />
            {/* Other Fields */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Enter price" />
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
                    <Input {...field} type="number" />
                  </FormControl>
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
        <Input {...field} value={form.getValues("description") ?? ''} />
      </FormControl>            
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
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
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(value) => field.onChange(value)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"secondary"}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;

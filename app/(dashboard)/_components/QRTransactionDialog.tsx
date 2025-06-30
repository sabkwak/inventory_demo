"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";  // Add this import
import { ReactNode} from "react";
import { useQuery } from '@tanstack/react-query';  // Import the useQuery hook for fetching product data
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
import UnitRetriever from "@/app/(dashboard)/_components/UnitRetriever";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransaction } from "@/app/(dashboard)/_actions/transactions";
import { toast } from "sonner";
import { DateToUTCDate } from "@/lib/helpers";
import { UserSettings } from "@prisma/client";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
  defaultProductId?: number;
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
    queryFn: () => fetch(`/api/products/user`).then((res) => res.json()),
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
    },
  });

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { data, isLoading, error } = useQuery({
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
  const { data: userSettings } = useQuery({
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
        cost: undefined,
        sellPrice: undefined,
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
      router.push("/inventory");
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
              <span className="m-1 capitalize text-blue-500">New Transaction</span>
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
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandList>
                            <CommandItem onSelect={() => field.onChange("add")}>
                              Add
                            </CommandItem>
                            <CommandItem onSelect={() => field.onChange("subtract")}>
                              Subtract
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
                    <ProductPicker userSettings={user}
                      defaultProductId={defaultProductId}
                      onChange={(productId: number) =>
                        form.setValue("productId", productId)
                      }
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


            {/* Other Fields */}
            {type === "add" && (
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Cost ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Enter production cost" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {(type === "sold" || type === "subtract" || type === "waste") && (
              <FormField
                control={form.control}
                name="sellPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="Enter selling price" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
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
                          className="w-[200px] pl-3 text-left font-normal"
                        >
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
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
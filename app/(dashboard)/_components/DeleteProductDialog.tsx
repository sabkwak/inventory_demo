"use client";

// import { DeleteProduct } from "@/app/(dashboard)/_actions/new-products";
import { DeleteProduct } from "@/app/(dashboard)/inventory/_actions/deleteProduct";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TransactionType } from "@/lib/types";
import { Product } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  product: Product;
  open: boolean;
  setOpen: (open: boolean) => void;
  productId: string;
}

function DeleteProductDialog({ productId, trigger }: Props) {
  // const productIdentifier = `${product.product}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteProduct,
    onSuccess: async () => {
      toast.success("Product deleted successfully", {
        id: productId,
      });

      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: () => {
      toast.error("Something went wrong", {
        id: productId,
      });
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            product
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting product...", {
                id: productId,
              });
              deleteMutation.mutate(productId);
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteProductDialog;

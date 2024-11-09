"use client";

import { DeleteBrand } from "@/app/(dashboard)/_actions/brands";
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
import { Brand } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  brand: Brand;
}

function DeleteBrandDialog({ brand, trigger }: Props) {
  const brandIdentifier = `${brand.name}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteBrand,
    onSuccess: async () => {
      toast.success("Brand deleted successfully", {
        id: brandIdentifier,
      });

      await queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
    onError: () => {
      toast.error("Please delete all Products assigned to this Brand under the Inventory tab first.", {
        id: brandIdentifier,
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
            brand
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting brand...", {
                id: brandIdentifier,
              });
              deleteMutation.mutate({
                name: brand.name,
                // icon: brand.icon

              });
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteBrandDialog;

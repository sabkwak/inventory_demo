"use client";

import { DeleteUnit } from "@/app/(dashboard)/_actions/units";
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
import { Unit } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  unit: Unit;
}

function DeleteUnitDialog({ unit, trigger }: Props) {
  const unitIdentifier = `${unit.name}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteUnit,
    onSuccess: async () => {
      toast.success("Unit deleted successfully", {
        id: unitIdentifier,
      });

      await queryClient.invalidateQueries({
        queryKey: ["units"],
      });
    },
    onError: () => {
      toast.error("Please delete all Products assigned to this Unit under the Inventory tab first.", {
        id: unitIdentifier,
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
            unit
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting unit...", {
                id: unitIdentifier,
              });
              deleteMutation.mutate({
                name: unit.name,
                // icon: unit.icon

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

export default DeleteUnitDialog;

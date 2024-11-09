"use client";

import { DeleteGrower } from "@/app/(dashboard)/_actions/growers";
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
import { Grower } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  grower: Grower;
}

function DeleteGrowerDialog({ grower, trigger }: Props) {
  const growerIdentifier = `${grower.name}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteGrower,
    onSuccess: async () => {
      toast.success("Grower deleted successfully", {
        id: growerIdentifier,
      });

      await queryClient.invalidateQueries({
        queryKey: ["growers"],
      });
    },
    onError: () => {
      toast.error("Please delete all Products assigned to this Grower under the Inventory tab first.", {
        id: growerIdentifier,
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
            grower
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting grower...", {
                id: growerIdentifier,
              });
              deleteMutation.mutate({
                name: grower.name,
                // icon: grower.icon

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

export default DeleteGrowerDialog;

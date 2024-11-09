"use client";

import { DeleteClient } from "@/app/(dashboard)/_actions/clients";
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
import { Client } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { toast } from "sonner";

interface Props {
  trigger: ReactNode;
  client: Client;
}

function DeleteClientDialog({ client, trigger }: Props) {
  const clientIdentifier = `${client.name}`;
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteClient,
    onSuccess: async () => {
      toast.success("Client deleted successfully", {
        id: clientIdentifier,
      });

      await queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
    },
    onError: () => {
      toast.error("Please delete all Transactions assigned to this Client under the Transactions tab first.", {
        id: clientIdentifier,
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
            client
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading("Deleting client...", {
                id: clientIdentifier,
              });
              deleteMutation.mutate({
                name: client.name,
                // icon: client.icon

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

export default DeleteClientDialog;

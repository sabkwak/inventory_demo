// "use client";

// import { DeleteIngredient } from "@/app/(dashboard)/_actions/ingredients";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { TransactionType } from "@/lib/types";
// import { Ingredient } from "@prisma/client";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import React, { ReactNode } from "react";
// import { toast } from "sonner";

// interface Props {
//   trigger: ReactNode;
//   ingredient: Ingredient;
// }

// function DeleteIngredientDialog({ ingredient, trigger }: Props) {
//   const ingredientIdentifier = `${ingredient.name}`;
//   const queryClient = useQueryClient();

//   const deleteMutation = useMutation({
//     mutationFn: DeleteIngredient,
//     onSuccess: async () => {
//       toast.success("Ingredient deleted successfully", {
//         id: ingredientIdentifier,
//       });

//       await queryClient.invalidateQueries({
//         queryKey: ["ingredients"],
//       });
//     },
//     onError: () => {
//       toast.error("Please delete all Products assigned to this Ingredient under the Inventory tab first.", {
//         id: ingredientIdentifier,
//       });
//     },
//   });
//   return (
//     <AlertDialog>
//       <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//           <AlertDialogDescription>
//             This action cannot be undone. This will permanently delete your
//             ingredient
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//           <AlertDialogAction
//             onClick={() => {
//               toast.loading("Deleting ingredient...", {
//                 id: ingredientIdentifier,
//               });
//               deleteMutation.mutate({
//                 name: ingredient.name,
//               });
//             }}
//           >
//             Continue
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }

// export default DeleteIngredientDialog;

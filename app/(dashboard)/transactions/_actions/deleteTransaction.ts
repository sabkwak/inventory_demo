"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function DeleteTransaction(id: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Find the transaction by its unique ID
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: parseInt(id),  // Ensure ID is an integer
    },
    include: {
      product: true,  // Include the related product in the query
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // Ensure the transaction belongs to the current user (you can uncomment if you have userId tracking)
  // if (transaction.userId !== user.id) {
  //   throw new Error("You don't have permission to delete this transaction");
  // }

  // Determine how the product's quantity should be updated
  // "sold" and "waste" are treated the same as "subtract" for inventory purposes
  const isSubtractType = transaction.type === "subtract" || transaction.type === "sold" || transaction.type === "waste";
  const productQuantityUpdate = {
    ...(transaction.type === "add" && { quantity: { decrement: transaction.amount } }),
    ...(isSubtractType && { quantity: { increment: transaction.amount } }),
    ...(transaction.type === "add" && { unitQuantity: { decrement: 1 } }),
    ...(isSubtractType && { unitQuantity: { increment: 1 } }),
  };

  await prisma.$transaction([
    // Delete the transaction
    prisma.transaction.delete({
      where: {
        id: parseInt(id),  // Use only the unique ID for deletion
      },
    }),
    // Update the product's quantity
    prisma.product.update({
      where: { id: transaction.productId },  // Update the correct product by its ID
      data: productQuantityUpdate,  // Apply the correct increment/decrement
    }),
    // Update the month history
    prisma.monthHistory.update({
      where: {
        day_month_year: {
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "add" && {
          add: { decrement: transaction.amount },
        }),
        ...(isSubtractType && {
          subtract: { decrement: transaction.amount },
        }),
      },
    }),
    // Update the year history
    prisma.yearHistory.update({
      where: {
        month_year: {
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "add" && {
          add: { decrement: transaction.amount },
        }),
        ...(isSubtractType && {
          subtract: { decrement: transaction.amount },
        }),
      },
    }),
  ]);
}

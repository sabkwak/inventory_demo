"use server";

import prisma from "@/lib/prisma";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { productId, price, amount, date, description, type } = parsedBody.data;

  // Fetch the product based on the productId
  const productRow = await prisma.product.findUnique({
    where: {
      id: productId, // Use productId to look up the product
    },
  });

  if (!productRow) {
    throw new Error("Product not found");
  }

  const currentInventory = productRow.quantity;

  // Calculate new inventory level based on the transaction type (order or return)
  const newInventory = type === "subtract" ? currentInventory - amount : currentInventory + amount;

  // Prevent negative inventory for orders
  if (newInventory < 0) {
    throw new Error("Error: Negative inventory not allowed");
    return;
  }

  // Proceed with transaction creation if inventory is valid
  await prisma.transaction.create({
    data: {
      amount: amount,
      price: price || undefined,
      description: description || "", // Set to empty string if not prosvided
      date: date,
      type: type,
      product: {
        connect: { id: productRow.id },    // Connect to an existing brand by ID
      },        },
  });

  // Update the product quantity
  await prisma.product.update({
    where: { id: productRow.id },
    data: {
      quantity: {
        increment: type === "subtract" ? -amount : amount, // Decrement for orders, increment for returns
      },
    },
  });

  // Update month aggregate table
  await prisma.monthHistory.upsert({
    where: {
      day_month_year: {
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
      },
    },
    create: {
      userId: user.id,
      day: date.getUTCDate(),
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      add: type === "add" ? amount : 0,
      subtract: type === "subtract" ? amount : 0,
    },
    update: {
      add: {
        increment: type === "add" ? amount : 0,
      },
      subtract: {
        increment: type === "subtract" ? amount : 0,
      },
    },
  });

  // Update year aggregate
  await prisma.yearHistory.upsert({
    where: {
      month_year: {
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
      },
    },
    create: {
      userId: user.id,
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      add: type === "add" ? amount : 0,
      subtract: type === "subtract" ? amount : 0,
    },
    update: {
      returns: {
        increment: type === "add" ? amount : 0,
      },
      order: {
        increment: type === "subtract" ? amount : 0,
      },
    },
  });
}

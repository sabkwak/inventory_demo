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
  const userIdUserSettings = user.emailAddresses[0]?.emailAddress || user.phoneNumbers[0]?.phoneNumber;

  const { productId, amount, date, description, type, cost, sellPrice } = parsedBody.data;

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

  // Calculate new inventory level based on the transaction type
  // "sold" and "waste" are treated the same as "subtract" for inventory purposes
  const isSubtractType = type === "subtract" || type === "sold" || type === "waste";
  const newInventory = isSubtractType ? currentInventory - amount : currentInventory + amount;

  // Prevent negative inventory for subtract types
  if (newInventory < 0) {
    throw new Error("Error: Negative inventory not allowed");
    return;
  }

  // Proceed with transaction creation if inventory is valid
  await prisma.transaction.create({
    data: {
      amount: amount,
      description: description || "",
      date: date,
      type: type,
      cost: type === "add" ? cost : undefined,
      sellPrice: (type === "sold" || type === "subtract" || type === "waste") ? sellPrice : undefined,
      product: {
        connect: { id: productRow.id },    // Connect to an existing brand by ID
      },
    },
  });

  // Update the product quantity
  await prisma.product.update({
    where: { id: productRow.id },
    data: {
      quantity: {
        increment: isSubtractType ? -amount : amount, // Decrement for subtract types, increment for add
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
      day: date.getUTCDate(),
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      add: type === "add" ? amount : 0,
      subtract: isSubtractType ? amount : 0,
    },
    update: {
      add: {
        increment: type === "add" ? amount : 0,
      },
      subtract: {
        increment: isSubtractType ? amount : 0,
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
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      add: type === "add" ? amount : 0,
      subtract: isSubtractType ? amount : 0,
    },
    update: {
      add: {
        increment: type === "add" ? amount : 0,
      },
      subtract: {
        increment: isSubtractType ? amount : 0,
      },
    },
  });
}

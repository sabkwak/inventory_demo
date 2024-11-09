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

  const { productId, client, price, amount, date, description, type } = parsedBody.data;

  // Fetch the product based on the productId
  const productRow = await prisma.product.findUnique({
    where: {
      id: productId, // Use productId to look up the product
    },
  });

  if (!productRow) {
    throw new Error("Product not found");
  }
  if (!client) {
    throw new Error("Client name is required.");
  }
  
  const clientRow = await prisma.client.findFirst({
    where: {
      name: client,
    },
  });
  
  if (!clientRow) {
    throw new Error("Client not found");
  }
  
  const currentInventory = productRow.quantity;

  // Calculate new inventory level based on the transaction type (order or return)
  const newInventory = type === "order" ? currentInventory - amount : currentInventory + amount;

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
      client: {
        connect: { id: clientRow.id },    // Connect to an existing grower by ID
      },      
      description: description || "", // Set to empty string if not provided
      date: date,
      type: type,
      product: {
        connect: { id: productRow.id },    // Connect to an existing grower by ID
      },        },
  });

  // Update the product quantity
  await prisma.product.update({
    where: { id: productRow.id },
    data: {
      quantity: {
        increment: type === "order" ? -amount : amount, // Decrement for orders, increment for returns
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
      returns: type === "returns" ? amount : 0,
      order: type === "order" ? amount : 0,
    },
    update: {
      returns: {
        increment: type === "returns" ? amount : 0,
      },
      order: {
        increment: type === "order" ? amount : 0,
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
      returns: type === "returns" ? amount : 0,
      order: type === "order" ? amount : 0,
    },
    update: {
      returns: {
        increment: type === "returns" ? amount : 0,
      },
      order: {
        increment: type === "order" ? amount : 0,
      },
    },
  });
}

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

  const { productId, price, priceType, amount, date, description, type } = parsedBody.data;

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
  const averageCost = productRow.value;
  // Calculate new inventory level based on the transaction type (order or return)
  const newInventory = type === "subtract" ? currentInventory - amount : currentInventory + amount;
  const unitPrice = price;
  // Prevent negative inventory for orders
  if (newInventory < 0) {
    throw new Error("Error: Negative inventory not allowed");
    return;
  }
  if (price !== undefined) {
    if (priceType === "total") {
  let unitPrice = price / amount;
    }
  else if (priceType === "unit") {
  let unitPrice = price;
    }
  }
  
  // Proceed with transaction creation if inventory is valid
  await prisma.transaction.create({
    data: {
      amount: amount,
      price: unitPrice,
      description: description || "", // Set to empty string if not prosvided
      date: date,
      type: type,
      product: {
        connect: { id: productRow.id },    // Connect to an existing brand by ID
      },        },
  });

  // Update the product quantity and average
if (price !== undefined) {
  const product = await prisma.product.findUnique({ where: { id: productRow.id } });
  if (product) {
    const newValue = product.value !== null
      ? (product.value + price) / 2
      : price;
    await prisma.product.update({ where: { id: productRow.id }, data: { value: newValue } });
  }
}

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
}


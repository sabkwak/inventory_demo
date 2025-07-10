"use server";

import prisma from "@/lib/prisma";
import {
  CreatePriceTierSchema,
  CreatePriceTierSchemaType,
  EditPriceTierSchema,
  EditPriceTierSchemaType,
} from "@/schema/priceTier";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function CreatePriceTier(form: CreatePriceTierSchemaType) {
  const parsedBody = CreatePriceTierSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name, description, price, isActive, minQuantity, maxQuantity, startDate, endDate, productId } = parsedBody.data;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check if price tier with same name already exists for this product
  const existingTier = await prisma.priceTier.findFirst({
    where: {
      productId,
      name,
    },
  });

  if (existingTier) {
    throw new Error(`Price tier "${name}" already exists for this product`);
  }

  const priceTier = await prisma.priceTier.create({
    data: {
      name,
      description,
      price,
      isActive,
      minQuantity,
      maxQuantity,
      startDate,
      endDate,
      product: {
        connect: { id: productId },
      },
    },
  });

  return priceTier;
}

export async function UpdatePriceTier(form: EditPriceTierSchemaType) {
  const parsedBody = EditPriceTierSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { id, name, description, price, isActive, minQuantity, maxQuantity, startDate, endDate, productId } = parsedBody.data;

  // Check if price tier exists
  const existingTier = await prisma.priceTier.findUnique({
    where: { id },
  });

  if (!existingTier) {
    throw new Error("Price tier not found");
  }

  // Check if another price tier with same name already exists for this product
  const duplicateTier = await prisma.priceTier.findFirst({
    where: {
      productId,
      name,
      id: { not: id }, // Exclude current tier
    },
  });

  if (duplicateTier) {
    throw new Error(`Price tier "${name}" already exists for this product`);
  }

  const priceTier = await prisma.priceTier.update({
    where: { id },
    data: {
      name,
      description,
      price,
      isActive,
      minQuantity,
      maxQuantity,
      startDate,
      endDate,
    },
  });

  return priceTier;
}

export async function DeletePriceTier(id: number) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Check if price tier exists
  const existingTier = await prisma.priceTier.findUnique({
    where: { id },
  });

  if (!existingTier) {
    throw new Error("Price tier not found");
  }

  // Check if any transactions are using this price tier
  const transactionsUsingTier = await prisma.transaction.findFirst({
    where: { priceTierId: id },
  });

  if (transactionsUsingTier) {
    throw new Error("Cannot delete price tier that is being used by transactions");
  }

  await prisma.priceTier.delete({
    where: { id },
  });

  return { success: true };
}

export async function GetPriceTiersForProduct(productId: number) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const priceTiers = await prisma.priceTier.findMany({
    where: {
      productId,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: new Date() } },
      ],
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ],
    },
    orderBy: {
      price: 'asc',
    },
  });

  return priceTiers;
}

export async function GetActivePriceTierForQuantity(productId: number, quantity: number) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const now = new Date();
  
  const priceTiers = await prisma.priceTier.findMany({
    where: {
      productId,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
      OR: [
        { minQuantity: null },
        { minQuantity: { lte: quantity } },
      ],
      OR: [
        { maxQuantity: null },
        { maxQuantity: { gte: quantity } },
      ],
    },
    orderBy: {
      price: 'asc',
    },
  });

  // Return the lowest price tier that matches the quantity
  return priceTiers[0] || null;
} 
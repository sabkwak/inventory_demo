"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DeleteProductSchema } from "@/schema/product"; // Import schema

export async function DeleteProduct(id: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Log the incoming ID for debugging purposes
  console.log("ID received:", id);

  // Convert the ID to a number
  const parsedId = parseInt(id, 10); // Ensure ID is parsed as a number

  // Ensure valid product ID by parsing with the schema
  const parsed = DeleteProductSchema.safeParse({ id: parsedId });
  if (!parsed.success) {
    console.error("Error parsing ID:", parsed.error.format());
    throw new Error("Invalid product ID");
  }

  // Find the product by its unique ID
  const product = await prisma.product.findUnique({
    where: {
      id: parsed.data.id, // Use parsed ID here
    },
  });

  if (!product) {
    throw new Error("Ingredient not found");
  }

  // Delete the product
  await prisma.product.delete({
    where: {
      id: parsed.data.id, // Use parsed ID here
    },
  });

  return "Ingredient deleted successfully";
}
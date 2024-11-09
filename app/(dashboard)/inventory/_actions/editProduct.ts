"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { EditProductSchema, EditProductSchemaType } from "@/schema/product";

export async function EditProduct({
  id,           // Product ID
  data,         // Form data
}: {
  id: number;
  data: EditProductSchemaType;
}) {

  // Ensure the user is logged in
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Log the incoming ID for debugging purposes
  console.log("ID received:", id);

  // Convert the ID to a number
  const parsedId = Number(id);
  if (isNaN(parsedId)) {
    console.error("Invalid product ID:", id);
    throw new Error("Invalid product ID");
  }

  // Validate the incoming form against the schema
  const parsed = EditProductSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Error parsing form:", parsed.error.format());
    throw new Error("Invalid product form");
  }

  const { product, quantity, value, category, grower, createdAt, description } = parsed.data;

   // Validate that the quantity is not negative
   if (quantity < 0) {
    throw new Error("Quantity cannot be negative.");
  }


  // Fetch grower ID from the grower code (e.g., "EV10")
  let growerConnect;
  if (grower) {
    const growerRecord = await prisma.grower.findUnique({
      where: { name: grower }, // Assuming 'code' is the field storing values like "EV10"
    });

    if (!growerRecord) {
      throw new Error(`Grower with code ${grower} not found`);
    }
    growerConnect = { connect: { id: growerRecord.id } };
  }

  // Fetch category ID from the category code (e.g., "MISC")
  let categoryConnect;
  if (category) {
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category }, // Assuming 'code' is the field storing values like "MISC"
    });

    if (!categoryRecord) {
      throw new Error(`Category with code ${category} not found`);
    }
    categoryConnect = { connect: { id: categoryRecord.id } };
  }

  // Log the grower and category connections before the update
  console.log("Grower connect:", growerConnect);
  console.log("Category connect:", categoryConnect);

  // Update the product in the database
  try {
    const updatedProduct = await prisma.product.update({
      where: {
        id: parsedId,
      },
      data: {
        product: parsed.data.product,  // Update ingredient name
        quantity,
        value: value || undefined,
        createdAt: new Date(createdAt),
        description: description || "",
        ...(growerConnect && { grower: growerConnect }),   // Only connect if grower is valid
        ...(categoryConnect && { category: categoryConnect }), // Only connect if category is valid
      },
    });

    return updatedProduct;
  } catch (error) {
    console.error("Error updating product details:", error); // Log the exact error
    throw new Error(`Product update failed`); // Pass the original error message for easier debugging
  }
}

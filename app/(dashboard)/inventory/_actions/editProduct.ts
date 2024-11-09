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

  const { product, quantity, value, unit, brand, createdAt, description } = parsed.data;

   // Validate that the quantity is not negative
   if (quantity < 0) {
    throw new Error("Quantity cannot be negative.");
  }


  // Fetch brand ID from the brand code (e.g., "EV10")
  let brandConnect;
  if (brand) {
    const brandRecord = await prisma.brand.findUnique({
      where: { name: brand }, // Assuming 'code' is the field storing values like "EV10"
    });

    if (!brandRecord) {
      throw new Error(`Brand with code ${brand} not found`);
    }
    brandConnect = { connect: { id: brandRecord.id } };
  }

  // Fetch unit ID from the unit code (e.g., "MISC")
  let unitConnect;
  if (unit) {
    const unitRecord = await prisma.unit.findUnique({
      where: { name: unit }, // Assuming 'code' is the field storing values like "MISC"
    });

    if (!unitRecord) {
      throw new Error(`Unit with code ${unit} not found`);
    }
    unitConnect = { connect: { id: unitRecord.id } };
  }

  // Log the brand and unit connections before the update
  console.log("Brand connect:", brandConnect);
  console.log("Unit connect:", unitConnect);

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
        ...(brandConnect && { brand: brandConnect }),   // Only connect if brand is valid
        ...(unitConnect && { unit: unitConnect }), // Only connect if unit is valid
      },
    });

    return updatedProduct;
  } catch (error) {
    console.error("Error updating product details:", error); // Log the exact error
    throw new Error(`Product update failed`); // Pass the original error message for easier debugging
  }
}

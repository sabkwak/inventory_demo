"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { EditTransactionSchema, EditTransactionSchemaType } from "@/schema/transaction";

export async function EditTransaction({
  id,           // Transaction ID
  data,         // Form data
}: {
  id: number;
  data: EditTransactionSchemaType;
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
    console.error("Invalid transaction ID:", id);
    throw new Error("Invalid transaction ID");
  }

  // Validate the incoming form against the schema
  const parsed = EditTransactionSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Error parsing form:", parsed.error.format());
    throw new Error("Invalid transaction form");
  }

  const { amount, price, client, type, date, description } = parsed.data;

   // Validate that the quantity is not negative
   if (amount < 0) {
    throw new Error("Amount cannot be negative.");
  }
  // Fetch client ID from the client code (e.g., "EV10")
  let clientConnect;
  if (client) {
    const clientRecord = await prisma.client.findUnique({
      where: { name: client }, // Assuming 'code' is the field storing values like "EV10"
    });

    if (!clientRecord) {
      throw new Error(`Client with code ${client} not found`);
    }
    clientConnect = { connect: { id: clientRecord.id } };
  }

  // Fetch type ID from the type code (e.g., "MISC")
  let typeConnect;
  if (type) {
    const typeRecord = await prisma.transaction.findUnique({
      where: { id:id }, // Assuming 'code' is the field storing values like "MISC"
    });

    if (!typeRecord) {
      throw new Error(`Type with code ${type} not found`);
    }
    typeConnect = { connect: { id: typeRecord.id } };
  }

  // Log the client and category connections before the update
  console.log("Type connect:", typeConnect);

  // Update the transaction in the database
  try {
    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: parsedId,
      },
      data: {
        amount,
        price,
        ...(clientConnect && { client: clientConnect }),   // Only connect if brand is valid

        date: new Date(date),
        description: description || "",
type         },
    });

    return updatedTransaction;
  } catch (error) {
    console.error("Error updating transaction details:", error); // Log the exact error
    throw new Error(`Transaction update failed`); // Pass the original error message for easier debugging
  }
}

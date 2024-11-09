import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const clientIdParam = searchParams.get("id"); // Get 'id' from query params if available

  // If clientId is provided, fetch a specific client by ID
  if (clientIdParam) {
    // Validate the clientId as a positive integer
    const clientIdSchema = z.number().int().positive();
    const parseResult = clientIdSchema.safeParse(Number(clientIdParam));

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const clientId = parseResult.data;

    // Fetch the client by ID from the database
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ name: client.name });
  }

  // If no clientId is provided, return all clients
  const clients = await prisma.client.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(clients);
}

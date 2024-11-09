import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
 
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      unit: true,
    },
    orderBy: {
      product: "asc",
    },
  });

  return Response.json(products);
}
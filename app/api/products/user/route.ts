import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const currentUserId = user.emailAddresses[0]?.emailAddress || user.phoneNumbers[0]?.phoneNumber;

  const products = await prisma.product.findMany({
    where: {
      userId: currentUserId,
    },
    include: {
      brand: true,
      category: true,
      unit: true,
    },
    orderBy: {
      product: "asc",
    },
  });

  return Response.json(currentUserId);
}
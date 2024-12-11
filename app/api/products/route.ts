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

  if (searchParams.get('userId')) {
    const userId = searchParams.get('userId');
    const products = await prisma.product.findMany({
      where: {
        userId: userId,
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
    return Response.json(products);
  } else {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        unit: true,
      },
      orderBy: {
        product: "asc",
      },
    });
    return Response.json(products);
  }
}

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return Response.json(user);
}
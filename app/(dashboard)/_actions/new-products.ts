"use server";

import prisma from "@/lib/prisma";
import {
  CreateProductSchema,
  CreateProductSchemaType,
  DeleteProductSchema,
  DeleteProductSchemaType,
} from "@/schema/product";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function CreateProduct(form: CreateProductSchemaType) {
  const parsedBody = CreateProductSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { product, quantity, value, unit, brand, createdAt, description } = parsedBody.data;

  // const productRow = await prisma.product.findFirst({
  //   where: {
  //     userId: user.id,
  //     icon: icon,
  //   },
  // });

  // if (!productRow) {
  //   throw new Error("unit not found");
  // }
  // Handle the optional unit
  let unitRow = null;
  if (unit) {
    unitRow = await prisma.unit.findFirst({
      where: { name: unit },
    });

    if (!unitRow) {
      throw new Error("Unit not found");
    }
  }
  
  const brandRow = await prisma.brand.findFirst({
    where: {
    
      name: brand,
    },
  });

  if (!brandRow) {
    throw new Error("brand not found");
  }

  // const ingredientRow = await prisma.ingredient.findFirst({
  //   where: {
    
  //     name: ingredient,
  //   },
  // });

  // if (!ingredientRow) {
  //   throw new Error("ingredient not found");
  // }


  return await prisma.product.create({
    data: {
      quantity,
      value: value || undefined,
      product,
      description: description || "", // Set to empty string if not provided
      // icon: icon ?? "",  // Default to an empty string if icon is null
      unit: unitRow ? { connect: { id: unitRow.id } } : undefined, // Conditionally connect to a unit
      brand: {
        connect: { id: brandRow.id },    // Connect to an existing brand by ID
      },
      // ingredient: {
      //   connect: { id: ingredientRow.id },    // Connect to an existing ingredient by ID
      // },
      // ingredientIcon: ingredientRow.icon,
      // description: description || "",
      // createdAt,
      createdAt,
        },
  })
  
  // Update month aggregate table
  // await prisma.monthHistory.upsert({
  //   where: {
  //     day_month_year_userId: {
  //       userId: user.id,
  //       day: createdAt.getUTCDate(),
  //       month: createdAt.getUTCMonth(),
  //       year: createdAt.getUTCFullYear(),
  //     },
  //   },
  //   create: {
  //     userId: user.id,
  //     day: createdAt.getUTCDate(),
  //     month: createdAt.getUTCMonth(),
  //     year: createdAt.getUTCFullYear(),
  //     returns: type === "returns" ? amount : 0,
  //     order: type === "order" ? amount : 0,
  //   },
  //   update: {
  //     returns: {
  //       increment: type === "returns" ? amount : 0,
  //     },
  //     order: {
  //       increment: type === "order" ? amount : 0,
  //     },
  //   },
  // })
  
  // // Update year aggreate
  // await prisma.yearHistory.upsert({
  //   where: {
  //     month_year_userId: {
  //       userId: user.id,
  //       month: createdAt.getUTCMonth(),
  //       year: createdAt.getUTCFullYear(),
  //     },
  //   },
  //   create: {
  //     userId: user.id,
  //     month: createdAt.getUTCMonth(),
  //     year: createdAt.getUTCFullYear(),
  //     returns: type === "returns" ? amount : 0,
  //     order: type === "order" ? amount : 0,
  //   },
  //   update: {
  //     returns: {
  //       increment: type === "returns" ? amount : 0,
  //     },
  //     order: {
  //       increment: type === "order" ? amount : 0,
  //     },
  //   },
  // })

}
export async function DeleteProduct(form: DeleteProductSchemaType) {
  const parsedBody = DeleteProductSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // return await prisma.product.delete({
  //   where: {
  //     product: parsedBody.data.product,  // 'product' is the unique field in your model
  //   },
  // });
}

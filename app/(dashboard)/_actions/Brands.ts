"use server";

import prisma from "@/lib/prisma";
import {
  CreateBrandSchema,
  CreateBrandSchemaType,
  DeleteBrandSchema,
  DeleteBrandSchemaType,
} from "@/schema/brands";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function CreateBrand(form: CreateBrandSchemaType) {
  const parsedBody = CreateBrandSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name, unit} = parsedBody.data;
  return await prisma.brand.create({
    data: {
      name,
      // icon,
    },
  });
}

export async function DeleteBrand(form: DeleteBrandSchemaType) {
  const parsedBody = DeleteBrandSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return await prisma.brand.delete({
    where: {
     
       
        name: parsedBody.data.name,
       
    },
  });
}

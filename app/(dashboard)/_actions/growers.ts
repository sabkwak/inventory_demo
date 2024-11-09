"use server";

import prisma from "@/lib/prisma";
import {
  CreateGrowerSchema,
  CreateGrowerSchemaType,
  DeleteGrowerSchema,
  DeleteGrowerSchemaType,
} from "@/schema/growers";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function CreateGrower(form: CreateGrowerSchemaType) {
  const parsedBody = CreateGrowerSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name} = parsedBody.data;
  return await prisma.grower.create({
    data: {
      name,
      // icon,
    },
  });
}

export async function DeleteGrower(form: DeleteGrowerSchemaType) {
  const parsedBody = DeleteGrowerSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return await prisma.grower.delete({
    where: {
     
       
        name: parsedBody.data.name,
       
    },
  });
}

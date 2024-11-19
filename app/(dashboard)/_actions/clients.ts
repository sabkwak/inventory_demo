"use server";

import prisma from "@/lib/prisma";
import {
  CreateClientSchema,
  CreateClientSchemaType,
  DeleteClientSchema,
  DeleteClientSchemaType,
} from "@/schema/clients";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function CreateClient(form: CreateClientSchemaType) {
  const parsedBody = CreateClientSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name } = parsedBody.data;
  return await prisma.client.create({
    data: {
      name,
      // icon,
    },
  });
}

export async function DeleteClient(form: DeleteClientSchemaType) {
  const parsedBody = DeleteClientSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return await prisma.client.delete({
    where: {
     
       
        name: parsedBody.data.name,
       
    },
  });
}

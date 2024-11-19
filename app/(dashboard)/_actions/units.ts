"use server";

import prisma from "@/lib/prisma";
import {
  CreateUnitSchema,
  CreateUnitSchemaType,
  DeleteUnitSchema,
  DeleteUnitSchemaType,
} from "@/schema/units";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function CreateUnit(form: CreateUnitSchemaType) {
  const parsedBody = CreateUnitSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name, unit} = parsedBody.data;
  return await prisma.unit.create({
    data: {
      name,
      // icon,
    },
  });
}

export async function DeleteUnit(form: DeleteUnitSchemaType) {
  const parsedBody = DeleteUnitSchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return await prisma.unit.delete({
    where: {
     
       
        name: parsedBody.data.name,
       
    },
  });
}

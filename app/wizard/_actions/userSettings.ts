"use server";

import prisma from "@/lib/prisma";
import { UpdateUserWeightSchema } from "@/schema/userSettings";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export async function UpdateUserWeight(weight: string) {
  const parsedBody = UpdateUserWeightSchema.safeParse({
    weight,
  });

  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const existingUserSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (existingUserSettings) {
    const userSettings = await prisma.userSettings.update({
      where: {
        userId: user.id,
      },
      data: {
        weight,
      },
    });
    return userSettings;
  } else {
    const userSettings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        weight,
      },
    });
    return userSettings;
  }
}
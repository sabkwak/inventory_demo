import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Determine the userId based on email or phone number
  const userId = user.emailAddresses[0]?.emailAddress || user.phoneNumbers[0]?.phoneNumber;

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unable to determine user identifier" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let userSettings = await prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });

  if (!userSettings) {
    userSettings = await prisma.userSettings.create({
      data: {
        userId,
        weight: "g",
        DefaultUnit: "g",
        email: user.emailAddresses[0]?.emailAddress || null,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
      },
    });
  }

  // Revalidate the home page that uses the user settings
  revalidatePath("/");
  return Response.json(userId);

}
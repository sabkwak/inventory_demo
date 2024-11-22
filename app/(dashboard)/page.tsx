import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";
import Overview from "@/app/(dashboard)/_components/Overview";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) {
    redirect("/wizard");
  }

  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <p className="text-3xl font-bold">Hello, {user.firstName}! 👋</p>

          <div className="flex items-center gap-3">



            <CreateTransactionDialog
              trigger={
                <Button
                  variant={"outline"}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                  >
Add Ingredient              </Button>
              }
              type="add"
            />           
             <CreateTransactionDialog
            trigger={
              <Button
                variant={"outline"}
                className="bg-gradient-to-r from-red-800 to-red-900 text-white hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out"

                >
Subtract Ingredient                </Button>
            }
            type="subtract"
          />
          </div>
        </div>
      </div>
      <Overview userSettings={userSettings} />

    </div>
  );
}

export default page;

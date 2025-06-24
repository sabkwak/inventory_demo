import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";
import Overview from "@/app/(dashboard)/_components/Overview";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { useQuery } from '@tanstack/react-query';
import ProfitLossKPI from "./_components/ProfitLossKPI";
import SubtractQuantityDropdown from "@/app/(dashboard)/_components/SubtractQuantityDropdown";
import CreateProductDialog from "@/app/(dashboard)/_components/CreateProductDialog"; // Import the CreateProductDialog component
import DashboardHeader from "@/app/(dashboard)/_components/DashboardHeader";

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
        <DashboardHeader userSettings={userSettings} userFirstName={user.firstName || "User"} />
      </div>
      <Overview userSettings={userSettings} />
      <ProfitLossKPI />
    </div>
  );
}

export default page;

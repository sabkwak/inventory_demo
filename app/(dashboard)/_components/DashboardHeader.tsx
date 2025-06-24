"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import CreateProductDialog from "@/app/(dashboard)/_components/CreateProductDialog";
import CreateTransactionDialog from "@/app/(dashboard)/_components/CreateTransactionDialog";
import SubtractQuantityDropdown from "@/app/(dashboard)/_components/SubtractQuantityDropdown";
import { UserSettings } from "@prisma/client";

interface DashboardHeaderProps {
  userSettings: UserSettings;
  userFirstName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userSettings, userFirstName }) => {
  return (
    <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
      <p className="text-3xl font-bold">Hello, {userFirstName}! 👋</p>
      <div className="flex items-center gap-3">
        <CreateProductDialog
          userSettings={userSettings}
          trigger={<Button>Create New Product</Button>}
          successCallback={() => {
            // Logic to handle after a product is successfully created
            console.log("Product created successfully");
          }}
        />
        <CreateTransactionDialog
          userSettings={userSettings}
          trigger={
            <Button
              variant={"outline"}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
            >
              Add Quantity
            </Button>
          }
          type="add"
        />
        <CreateTransactionDialog
          userSettings={userSettings}
          trigger={<SubtractQuantityDropdown userSettings={userSettings} />}
          type="subtract"
        />
      </div>
    </div>
  );
};

export default DashboardHeader; 
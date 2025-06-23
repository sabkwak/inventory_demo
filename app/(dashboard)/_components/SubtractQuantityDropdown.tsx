"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import CreateTransactionDialog from "./CreateTransactionDialog";
import { UserSettings } from "@prisma/client";

interface Props {
  userSettings: UserSettings;
}

type SubtractType = "sold" | "waste";

function SubtractQuantityDropdown({ userSettings }: Props) {
  const [selectedType, setSelectedType] = useState<SubtractType>("sold");
  const [showDialog, setShowDialog] = useState(false);

  const getTypeLabel = (type: SubtractType) => {
    switch (type) {
      case "sold":
        return "Sold Item";
      case "waste":
        return "Waste";
      default:
        return "Sold Item";
    }
  };

  const handleTypeSelect = (type: SubtractType) => {
    setSelectedType(type);
    setShowDialog(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            className="bg-gradient-to-r from-red-800 to-red-900 text-white hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out"
          >
            Subtract Quantity
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => handleTypeSelect("sold")}
            className="flex flex-col items-start p-3"
          >
            <div className="font-medium">Sold Item</div>
            <div className="text-sm text-muted-foreground">
              Item was sold to a customer
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleTypeSelect("waste")}
            className="flex flex-col items-start p-3"
          >
            <div className="font-medium">Waste</div>
            <div className="text-sm text-muted-foreground">
              Item was discarded or spoiled
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDialog && (
        <CreateTransactionDialog
          userSettings={userSettings}
          trigger={<div style={{ display: 'none' }} />}
          type={selectedType}
          open={showDialog}
          setOpen={setShowDialog}
        />
      )}
    </>
  );
}

export default SubtractQuantityDropdown; 
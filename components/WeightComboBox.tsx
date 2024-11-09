"use client";

import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Weights, Weight } from "@/lib/weight";
import { useMutation, useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { UserSettings } from "@prisma/client";
import { UpdateUserWeight } from "@/app/wizard/_actions/userSettings";
import { toast } from "sonner";

export function WeightComboBox() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedOption, setSelectedOption] = React.useState<Weight | null>(
    null
  );

  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
  });

  React.useEffect(() => {
    if (!userSettings.data) return;
    const userWeight = Weights.find(
      (weight) => weight.value === userSettings.data.weight
    );
    if (userWeight) setSelectedOption(userWeight);
  }, [userSettings.data]);

  const mutation = useMutation({
    mutationFn: UpdateUserWeight,
    onSuccess: (data: UserSettings) => {
      toast.success(`Weight updated successuflly 🎉`, {
        id: "update-weight",
      });

      setSelectedOption(
        Weights.find((c) => c.value === data.weight) || null
      );
    },
    onError: (e) => {
      console.error(e);
      toast.error("Something went wrong", {
        id: "update-weight",
      });
    },
  });

  const selectOption = React.useCallback(
    (weight: Weight | null) => {
      if (!weight) {
        toast.error("Please select a weight");
        return;
      }

      toast.loading("Updating weight...", {
        id: "update-weight",
      });

      mutation.mutate(weight.value);
    },
    [mutation]
  );

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={mutation.isPending}
            >
              {selectedOption ? <>{selectedOption.label}</> : <>Set weight</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    );
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={mutation.isPending}
          >
            {selectedOption ? <>{selectedOption.label}</> : <>Set weight</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  );
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void;
  setSelectedOption: (status: Weight | null) => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter weight..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {Weights.map((weight: Weight) => (
            <CommandItem
              key={weight.value}
              value={weight.value}
              onSelect={(value) => {
                setSelectedOption(
                  Weights.find((priority) => priority.value === value) ||
                    null
                );
                setOpen(false);
              }}
            >
              {weight.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

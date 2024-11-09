"use client";

import CreateClientDialog from "@/app/(dashboard)/_components/CreateClientDialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Client } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface Props {
  onChange: (value: string) => void;
  clientName: string;
}

function ClientPicker({  onChange, clientName }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (!value) return;
    // when the value changes, call onChange callback
    onChange(value);
  }, [onChange, value]);

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      fetch(`/api/clients`).then((res) => res.json()),
  });

  // Ensure clientsQuery.data is an array
  const clients = Array.isArray(clientsQuery.data) ? clientsQuery.data : [];

  const selectedClient = clients.find(
    (client: Client) => client.name === value
  );

  const successCallback = useCallback(
    (client: Client) => {
      setValue(client.name);
      setOpen((prev) => !prev);
    },
    [setValue, setOpen]
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedClient ? (
            <ClientRow client={selectedClient} />
          ) : (
            "Select client"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 max-h-[300px] overflow-y-auto">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="Search client..." />
          <CreateClientDialog successCallback={successCallback} />
          <CommandEmpty>
            <p>Client not found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Create a new client
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {clients.map((client: Client) => (
                <CommandItem
                  key={client.name}
                  onSelect={() => {
                    setValue(client.name);
                    setOpen((prev) => !prev);
                  }}
                >
                  <ClientRow client={client} />
                  <Check
                    className={cn(
                      "mr-2 w-4 h-4 opacity-0",
                      value === client.name && "opacity-100"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default ClientPicker;

function ClientRow({ client }: { client: Client }) {
  return (
    <div className="flex items-center gap-2">
      {/* <span role="img">{client.icon}</span> */}
      <span>{client.name}</span>
    </div>
  );
}
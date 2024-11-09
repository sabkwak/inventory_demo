// "use client";

// import CreateStrainDialog from "@/app/(dashboard)/_components/CreateStrainDialog";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { TransactionType } from "@/lib/types";
// import { cn } from "@/lib/utils";
// import { Strain } from "@prisma/client";
// import { useQuery } from "@tanstack/react-query";
// import { Check, ChevronsUpDown } from "lucide-react";
// import React, { useCallback, useEffect, useState } from "react";

// interface Props {

//   onChange: (value: string) => void;
// }

// function StrainPicker({ onChange }: Props) {
//   const [open, setOpen] = React.useState(false);
//   const [value, setValue] = React.useState("");

//   useEffect(() => {
//     if (!value) return;
//     // when the value changes, call onChange callback
//     onChange(value);
//   }, [onChange, value]);

//   const strainsQuery = useQuery({
//     queryKey: ["strains"],
//     queryFn: () =>
//       fetch(`/api/strains`).then((res) => res.json()),
//   });

//   // Ensure strainsQuery.data is an array
//   const strains = Array.isArray(strainsQuery.data) ? strainsQuery.data : [];

//   const selectedStrain = strains.find(
//     (strain: Strain) => strain.name === value
//   );

//   const successCallback = useCallback(
//     (strain: Strain) => {
//       setValue(strain.name);
//       setOpen((prev) => !prev);
//     },
//     [setValue, setOpen]
//   );

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant={"outline"}
//           role="combobox"
//           aria-expanded={open}
//           className="w-[200px] justify-between"
//         >
//           {selectedStrain ? (
//             <StrainRow strain={selectedStrain} />
//           ) : (
//             "Select strain"
//           )}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[200px] p-0">
//         <Command
//           onSubmit={(e) => {
//             e.preventDefault();
//           }}
//         >
//           <CommandInput placeholder="Search strain..." />
//           <CreateStrainDialog successCallback={successCallback} />
//           <CommandEmpty>
//             <p>Strain not found</p>
//             <p className="text-xs text-muted-foreground">
//               Tip: Create a new strain
//             </p>
//           </CommandEmpty>
//           <CommandGroup>
//             <CommandList>
//               {strains.map((strain: Strain) => (
//                 <CommandItem
//                   key={strain.name}
//                   onSelect={() => {
//                     setValue(strain.name);
//                     setOpen((prev) => !prev);
//                   }}
//                 >
//                   <StrainRow strain={strain} />
//                   <Check
//                     className={cn(
//                       "mr-2 w-4 h-4 opacity-0",
//                       value === strain.name && "opacity-100"
//                     )}
//                   />
//                 </CommandItem>
//               ))}
//             </CommandList>
//           </CommandGroup>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

// export default StrainPicker;

// function StrainRow({ strain }: { strain: Strain }) {
//   return (
//     <div className="flex items-center gap-2">
//       {/* <span role="img">{strain.icon}</span> */}
//       <span>{strain.name}</span>
//     </div>
//   );
// }
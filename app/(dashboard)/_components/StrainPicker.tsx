// "use client";

// import CreateIngredientDialog from "@/app/(dashboard)/_components/CreateIngredientDialog";
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
// import { Ingredient } from "@prisma/client";
// import { useQuery } from "@tanstack/react-query";
// import { Check, ChevronsUpDown } from "lucide-react";
// import React, { useCallback, useEffect, useState } from "react";

// interface Props {

//   onChange: (value: string) => void;
// }

// function IngredientPicker({ onChange }: Props) {
//   const [open, setOpen] = React.useState(false);
//   const [value, setValue] = React.useState("");

//   useEffect(() => {
//     if (!value) return;
//     // when the value changes, call onChange callback
//     onChange(value);
//   }, [onChange, value]);

//   const ingredientsQuery = useQuery({
//     queryKey: ["ingredients"],
//     queryFn: () =>
//       fetch(`/api/ingredients`).then((res) => res.json()),
//   });

//   // Ensure ingredientsQuery.data is an array
//   const ingredients = Array.isArray(ingredientsQuery.data) ? ingredientsQuery.data : [];

//   const selectedIngredient = ingredients.find(
//     (ingredient: Ingredient) => ingredient.name === value
//   );

//   const successCallback = useCallback(
//     (ingredient: Ingredient) => {
//       setValue(ingredient.name);
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
//           {selectedIngredient ? (
//             <IngredientRow ingredient={selectedIngredient} />
//           ) : (
//             "Select ingredient"
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
//           <CommandInput placeholder="Search ingredient..." />
//           <CreateIngredientDialog successCallback={successCallback} />
//           <CommandEmpty>
//             <p>Ingredient not found</p>
//             <p className="text-xs text-muted-foreground">
//               Tip: Create a new ingredient
//             </p>
//           </CommandEmpty>
//           <CommandGroup>
//             <CommandList>
//               {ingredients.map((ingredient: Ingredient) => (
//                 <CommandItem
//                   key={ingredient.name}
//                   onSelect={() => {
//                     setValue(ingredient.name);
//                     setOpen((prev) => !prev);
//                   }}
//                 >
//                   <IngredientRow ingredient={ingredient} />
//                   <Check
//                     className={cn(
//                       "mr-2 w-4 h-4 opacity-0",
//                       value === ingredient.name && "opacity-100"
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

// export default IngredientPicker;

// function IngredientRow({ ingredient }: { ingredient: Ingredient }) {
//   return (
//     <div className="flex items-center gap-2">
//       {/* <span role="img">{ingredient.icon}</span> */}
//       <span>{ingredient.name}</span>
//     </div>
//   );
// }
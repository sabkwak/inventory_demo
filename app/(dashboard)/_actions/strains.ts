// "use server";

// import prisma from "@/lib/prisma";
// import {
//   CreateIngredientSchema,
//   CreateIngredientSchemaType,
//   DeleteIngredientSchema,
//   DeleteIngredientSchemaType,
// } from "@/schema/ingredients";
// import { currentUser } from "@clerk/nextjs";
// import { redirect } from "next/navigation";

// export async function CreateIngredient(form: CreateIngredientSchemaType) {
//   const parsedBody = CreateIngredientSchema.safeParse(form);
//   if (!parsedBody.success) {
//     throw new Error("bad request");
//   }

//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   const { name, unit} = parsedBody.data;
//   return await prisma.ingredient.create({
//     data: {
//       name,
//       // icon,
//     },
//   });
// }

// export async function DeleteIngredient(form: DeleteIngredientSchemaType) {
//   const parsedBody = DeleteIngredientSchema.safeParse(form);
//   if (!parsedBody.success) {
//     throw new Error("bad request");
//   }

//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   // Check if any products are referencing this ingredient
//   const products = await prisma.product.findMany({
//     where: {
//       ingredient: {
//         name: parsedBody.data.name,
//       },
//     },
//   });

//   if (products.length > 0) {
//     throw new Error("Cannot delete ingredient: it is being referenced by products");
//   }

//   // If no products reference the ingredient, delete it
//   return await prisma.ingredient.delete({
//     where: {
//       name: parsedBody.data.name,
//     },
//   });
// }


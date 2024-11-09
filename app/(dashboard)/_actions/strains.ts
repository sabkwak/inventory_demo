// "use server";

// import prisma from "@/lib/prisma";
// import {
//   CreateStrainSchema,
//   CreateStrainSchemaType,
//   DeleteStrainSchema,
//   DeleteStrainSchemaType,
// } from "@/schema/strains";
// import { currentUser } from "@clerk/nextjs";
// import { redirect } from "next/navigation";

// export async function CreateStrain(form: CreateStrainSchemaType) {
//   const parsedBody = CreateStrainSchema.safeParse(form);
//   if (!parsedBody.success) {
//     throw new Error("bad request");
//   }

//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   const { name} = parsedBody.data;
//   return await prisma.strain.create({
//     data: {
//       name,
//       // icon,
//     },
//   });
// }

// export async function DeleteStrain(form: DeleteStrainSchemaType) {
//   const parsedBody = DeleteStrainSchema.safeParse(form);
//   if (!parsedBody.success) {
//     throw new Error("bad request");
//   }

//   const user = await currentUser();
//   if (!user) {
//     redirect("/sign-in");
//   }

//   // Check if any products are referencing this strain
//   const products = await prisma.product.findMany({
//     where: {
//       strain: {
//         name: parsedBody.data.name,
//       },
//     },
//   });

//   if (products.length > 0) {
//     throw new Error("Cannot delete strain: it is being referenced by products");
//   }

//   // If no products reference the strain, delete it
//   return await prisma.strain.delete({
//     where: {
//       name: parsedBody.data.name,
//     },
//   });
// }


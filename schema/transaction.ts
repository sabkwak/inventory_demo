import { z } from "zod";

export const CreateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
   price: z.preprocess((price) => {
    if (price === "" || price === undefined) return undefined;
    return Number(price);
  }, z.number().optional()),
    priceType: z.string().optional(),

  productId: z.number(),  // Use productId as it's unique
  description: z.string().nullable().optional(), // Make description optional
  date: z.coerce.date(),
  // client: z.string().nullable().optional(),
  // categoryIcon: z.string().optional(),
  // category: z.string(),
  // brand: z.string(),
  // brandIcon: z.string().optional(),
  // ingredient: z.string(),
  // ingredientIcon: z.string().optional(),
  type: z.union([z.literal("subtract"), z.literal("add"), z.literal("sold"), z.literal("waste")]),
}).refine((data) => {
  if (data.price !== undefined && data.price !== null && data.priceType === undefined) {
    return false;
  }
  return true;
}, {
  message: "Please select a price type if you enter a price",
});

export type CreateTransactionSchemaType = z.infer<
  typeof CreateTransactionSchema
>;
export const EditTransactionSchema = z.object({
  id: z.number(), // Using ID instead of name for deletion
  price: z.preprocess((price) => {
    if (price === "" || price === undefined) return undefined;
    return Number(price);
  }, z.number().optional()),
  // client: z.string(),
  amount: z.coerce.number().min(0).multipleOf(0.01).default(0), // Make it optional with a default value of 0
  date: z.coerce.date(),
  description: z.string().nullable().optional(), // Make description optional
  // categoryIcon: z.string().optional(),
  type: z.union([z.literal("subtract"), z.literal("add"), z.literal("sold"), z.literal("waste")]),
});

export type EditTransactionSchemaType = z.infer<typeof EditTransactionSchema>;
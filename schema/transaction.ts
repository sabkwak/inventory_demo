import { z } from "zod";

export const CreateTransactionSchema = z.object({
  amount: z.coerce.number().positive().multipleOf(0.01),
  cost: z.preprocess((cost) => {
    if (cost === "" || cost === undefined) return undefined;
    return Number(cost);
  }, z.number().optional()),
  sellPrice: z.preprocess((sellPrice) => {
    if (sellPrice === "" || sellPrice === undefined) return undefined;
    return Number(sellPrice);
  }, z.number().optional()),
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
  type: z.union([
    z.literal("subtract"),
    z.literal("add"),
    z.literal("sold"),
    z.literal("waste")
  ]),
}).refine((data) => {
  if (data.type === "add" && (data.cost === undefined || data.cost === null)) {
    return false;
  }
  if ((data.type === "sold" || data.type === "subtract") && (data.sellPrice === undefined || data.sellPrice === null)) {
    return false;
  }
  return true;
}, {
  message: "Please enter cost for 'add' or sell price for 'sold'/'subtract' transactions.",
});

export type CreateTransactionSchemaType = z.infer<
  typeof CreateTransactionSchema
>;

export const EditTransactionSchema = z.object({
  id: z.number(), // Using ID instead of name for deletion
  cost: z.preprocess((cost) => {
    if (cost === "" || cost === undefined) return undefined;
    return Number(cost);
  }, z.number().optional()),
  sellPrice: z.preprocess((sellPrice) => {
    if (sellPrice === "" || sellPrice === undefined) return undefined;
    return Number(sellPrice);
  }, z.number().optional()),
  // client: z.string(),
  amount: z.coerce.number().min(0).multipleOf(0.01).default(0), // Make it optional with a default value of 0
  date: z.coerce.date(),
  description: z.string().nullable().optional(), // Make description optional
  // categoryIcon: z.string().optional(),
  type: z.union([
    z.literal("subtract"),
    z.literal("add"),
    z.literal("sold"),
    z.literal("waste")
  ]),
});

export type EditTransactionSchemaType = z.infer<typeof EditTransactionSchema>;
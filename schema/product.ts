import { z } from "zod";

export const CreateProductSchema = z.object({
  // userId: z.string(),
  product: z.string(),
  value: z.preprocess((value) => {
    if (value === "" || value === undefined) return undefined;
    return Number(value);
  }, z.number().optional()),
  priceType: z.string().optional(),
  quantity: z.preprocess((quantity) => {
    if (quantity === "" || quantity === undefined) return 0; // Default to 0 if empty
    return Number(quantity);
  }, z.number().min(0).multipleOf(0.01)), // Use preprocess to handle string input
  createdAt: z.coerce.date(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(), 
  unit: z.string().nullable().optional(),
  brand: z.string(),
  selling_price_per_unit: z.preprocess((value) => {
    if (value === "" || value === undefined) return undefined;
    return Number(value);
  }, z.number().optional()),
  expiry_date: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return undefined;
  }, z.date().optional()),
  min_stock: z.preprocess((value) => {
    if (value === "" || value === undefined) return 0;
    return Number(value);
  }, z.number().optional()),
});


export type CreateProductSchemaType = z.infer<
  typeof CreateProductSchema
>;
export const DeleteProductSchema = z.object({
  id: z.number(), // Using ID instead of name for deletion
});

export type DeleteProductSchemaType = z.infer<typeof DeleteProductSchema>;

export const EditProductSchema = z.object({

  // user: z.string(),
  id: z.number(), // Using ID instead of name for deletion
  product: z.coerce.string(),
  quantity: z.coerce.number().min(0).multipleOf(0.01).default(0), // Make it optional with a default value of 0
  createdAt: z.coerce.date(),
  description: z.string().nullable().optional(), // Make description optional
  value: z.preprocess((value) => {
    if (value === "" || value === undefined) return undefined;
    return Number(value);
  }, z.number().optional()),
  priceType: z.string().optional(),
    category: z.string().nullable().optional(), // Make category optional
    unit: z.string().nullable().optional(), // Make unit optional
  brand: z.string(),
  selling_price_per_unit: z.preprocess((value) => {
    if (value === "" || value === undefined) return undefined;
    return Number(value);
  }, z.number().optional()),
  expiry_date: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return undefined;
  }, z.date().optional()),
  min_stock: z.preprocess((value) => {
    if (value === "" || value === undefined) return 0;
    return Number(value);
  }, z.number().optional()),
});

export type EditProductSchemaType = z.infer<typeof EditProductSchema>;
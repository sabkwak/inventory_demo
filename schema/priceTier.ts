import { z } from "zod";

export const CreatePriceTierSchema = z.object({
  name: z.string().min(1, "Price tier name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  isActive: z.boolean().default(true),
  minQuantity: z.number().optional(),
  maxQuantity: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  productId: z.number(),
}).refine((data) => {
  // If both minQuantity and maxQuantity are provided, max should be greater than min
  if (data.minQuantity && data.maxQuantity) {
    return data.maxQuantity > data.minQuantity;
  }
  return true;
}, {
  message: "Maximum quantity must be greater than minimum quantity",
}).refine((data) => {
  // If both startDate and endDate are provided, end should be after start
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
});

export const EditPriceTierSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Price tier name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  isActive: z.boolean().default(true),
  minQuantity: z.number().optional(),
  maxQuantity: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  productId: z.number(),
}).refine((data) => {
  // If both minQuantity and maxQuantity are provided, max should be greater than min
  if (data.minQuantity && data.maxQuantity) {
    return data.maxQuantity > data.minQuantity;
  }
  return true;
}, {
  message: "Maximum quantity must be greater than minimum quantity",
}).refine((data) => {
  // If both startDate and endDate are provided, end should be after start
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
});

export type CreatePriceTierSchemaType = z.infer<typeof CreatePriceTierSchema>;
export type EditPriceTierSchemaType = z.infer<typeof EditPriceTierSchema>; 
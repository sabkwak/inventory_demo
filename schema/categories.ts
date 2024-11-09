import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(20),
  // icon: z.string().max(20),
  // type: z.string().default("order").refine((val) => ["order", "returns"].includes(val), {
  //   message: "Type must be either 'order' or 'returns'",
  // }),
});

export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;

export const DeleteCategorySchema = z.object({
  name: z.string().min(1).max(20),
  // icon: z.string().max(20),
});

export type DeleteCategorySchemaType = z.infer<typeof DeleteCategorySchema>;
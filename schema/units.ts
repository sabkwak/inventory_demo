import { z } from "zod";

export const CreateUnitSchema = z.object({
  name: z.string().min(1).max(20),
  // icon: z.string().max(20),
  unitType: z.string().default("Weight"),
});

export type CreateUnitSchemaType = z.infer<typeof CreateUnitSchema>;

export const DeleteUnitSchema = z.object({
  name: z.string().min(1).max(20),
  // icon: z.string().max(20),
});

export type DeleteUnitSchemaType = z.infer<typeof DeleteUnitSchema>;
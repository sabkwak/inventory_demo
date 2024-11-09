import { z } from "zod";

export const CreateBrandSchema = z.object({
  name: z.string().min(1).max(20),
  // icon: z.string().max(20),
  

});

export type CreateBrandSchemaType = z.infer<typeof CreateBrandSchema>;

export const DeleteBrandSchema = z.object({
  name: z.string().min(1).max(20),
  // icon: z.string().max(20)

 
});

export type DeleteBrandSchemaType = z.infer<typeof DeleteBrandSchema>;
import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string(),
  // icon: z.string().max(20),
  

});

export type CreateClientSchemaType = z.infer<typeof CreateClientSchema>;

export const DeleteClientSchema = z.object({
  name: z.string(),
  // icon: z.string().max(20)

 
});

export type DeleteClientSchemaType = z.infer<typeof DeleteClientSchema>;
import { Weights } from "@/lib/weight";
import { z } from "zod";

export const UpdateUserWeightSchema = z.object({
  weight: z.custom((value) => {
    const found = Weights.some((c) => c.value === value);
    if (!found) {
      throw new Error(`invalid weight: ${value}`);
    }

    return value;
  }),
});

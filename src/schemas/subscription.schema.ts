import { z } from "zod";

export const subscribeSchema = z.object({
  userId: z.string().min(1),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

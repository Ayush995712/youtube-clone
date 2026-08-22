import { z } from "zod";

export const likeSchema = z.object({
  uploadId: z.string().min(1),
});

export type LikeInput = z.infer<typeof likeSchema>;

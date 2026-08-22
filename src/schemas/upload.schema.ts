import { z } from "zod";

export const presignedUrlSchema = z.object({
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
  fileName: z.string().min(1),
});

export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>;

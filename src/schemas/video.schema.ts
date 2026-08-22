import { z } from "zod";

export const uploadSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  videoUrl: z.url(),
  thumbnail: z.url(),
});

export type UploadInput = z.infer<typeof uploadSchema>;

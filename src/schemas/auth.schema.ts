import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.enum(["Male", "Female", "Other"]),
  channelName: z.string().trim().min(1, "Channel name is required"),
});

export const signinSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;

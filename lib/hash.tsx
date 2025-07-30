import { object, string } from "zod";

export const signInSchema = object({
  email: string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email" }),
    
  password: string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be more than 8 characters" })
    .max(32, { message: "Password must be less than 32 characters" }),
});

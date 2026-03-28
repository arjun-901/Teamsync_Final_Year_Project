import { z } from "zod";
import { emailSchema, passwordSchema } from "./auth.validation";

export const updateCurrentUserProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  email: emailSchema,
});

export const changeCurrentUserPasswordSchema = z
  .object({
    currentPassword: z.string().trim().optional(),
    newPassword: passwordSchema,
    confirmPassword: z.string().trim().min(4),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password must match.",
    path: ["confirmPassword"],
  });

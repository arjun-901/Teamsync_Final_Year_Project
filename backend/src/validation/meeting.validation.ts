import { z } from "zod";

export const createMeetingSchema = z.object({
  workspaceId: z
    .string()
    .trim()
    .min(1, { message: "Workspace ID is required" }),
  projectId: z.string().trim().optional(),
  title: z
    .string()
    .trim()
    .min(1, { message: "Meeting title is required" })
    .max(255, { message: "Title must be 255 characters or less" }),
  description: z
    .string()
    .trim()
    .optional(),
  scheduledAt: z
    .string()
    .or(z.date())
    .refine(
      (val) => {
        const date = typeof val === "string" ? new Date(val) : val;
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format for scheduledAt" }
    ),
  duration: z
    .number()
    .positive({ message: "Duration must be greater than 0" }),
  participants: z.array(z.string()).optional(),
});

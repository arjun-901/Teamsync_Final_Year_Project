import { z } from "zod";

export const projectChatMessageSchema = z.object({
  message: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const projectChatPaginationSchema = z.object({
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  pageNumber: z.coerce.number().int().min(1).optional(),
});

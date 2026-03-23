import { z } from "zod";

export const updateProjectMembersSchema = z.object({
  memberIds: z.array(z.string().trim().min(1)).default([]),
});

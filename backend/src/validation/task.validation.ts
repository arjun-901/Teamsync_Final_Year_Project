import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";

export const titleSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().trim().optional();

export const assignedToSchema = z
  .array(z.string().trim().min(1))
  .min(1, { message: "At least one assignee is required" })
  .optional();

export const prioritySchema = z.enum(
  Object.values(TaskPriorityEnum) as [string, ...string[]]
);

export const statusSchema = z.enum(
  Object.values(TaskStatusEnum) as [string, ...string[]]
);

export const dueDateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      return !val || !isNaN(Date.parse(val));
    },
    {
      message: "Invalid date format. Please provide a valid date string.",
    }
  );

export const taskIdSchema = z.string().trim().min(1);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema,
});

export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    priority: prioritySchema.optional(),
    status: statusSchema.optional(),
    assignedTo: assignedToSchema,
    dueDate: dueDateSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update the task.",
  });

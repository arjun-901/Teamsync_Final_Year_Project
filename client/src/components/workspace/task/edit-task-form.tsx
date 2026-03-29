import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { CalendarIcon, Loader } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import { editTaskMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TaskType } from "@/types/api.type";
import useGetProjectMembers from "@/hooks/api/use-get-project-members";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import TaskAssigneeMultiSelect from "./task-assignee-multi-select";
import { normalizeTaskAssignees } from "@/lib/helper";

export default function EditTaskForm({ task, onClose }: { task: TaskType; onClose: () => void }) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { hasPermission, user } = useAuthContext();
  const canFullyEditTask = hasPermission(Permissions.EDIT_TASK);
  const taskAssignees = normalizeTaskAssignees(task.assignedTo);
  const canUpdateOwnTaskStatus = taskAssignees.some(
    (assignee) => assignee._id === user?._id
  );
  const isStatusOnlyMode = !canFullyEditTask && canUpdateOwnTaskStatus;

  const { mutate, isPending } = useMutation({
    mutationFn: editTaskMutationFn,
  });

  const { data: memberData } = useGetProjectMembers({
    workspaceId,
    projectId: task.project?._id,
    skip: !task.project?._id,
  });
  const members =
    memberData?.members?.filter((member) => member.isProjectMember) || [];

  // Members Dropdown Options
  const membersOptions = members.map((member) => ({
    value: member.userId?._id || "",
    name: member.userId?.name || "Unknown",
    profilePicture: member.userId?.profilePicture || null,
  }));

  // Status & Priority Options
  const statusOptions = Object.values(TaskStatusEnum).map((status) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  }));

  const priorityOptions = Object.values(TaskPriorityEnum).map((priority) => ({
    label: priority.charAt(0) + priority.slice(1).toLowerCase(),
    value: priority,
  }));

  const formSchema = z.object({
    title: z.string().trim().min(1, { message: "Title is required" }),
    description: z.string().trim(),
    status: z.enum(Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum]),
    priority: z.enum(Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum]),
    assignedTo: z.array(z.string()).min(1, {
      message: "Select at least one assignee",
    }),
    dueDate: z.date({ required_error: "A due date is required." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "TODO",
      priority: task?.priority ?? "MEDIUM",
      assignedTo: taskAssignees.map((assignee) => assignee._id),
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
    },
  });

  useEffect(() => {
    const assignedTo = form.getValues("assignedTo");

    if (assignedTo.length === 0) return;

    const validAssignees = assignedTo.filter((memberId) =>
      members.some((member) => member.userId._id === memberId)
    );

    if (validAssignees.length !== assignedTo.length) {
      form.setValue("assignedTo", validAssignees, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, members]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    const formData = isStatusOnlyMode
      ? {
          status: values.status,
        }
      : {
          ...values,
          dueDate: values.dueDate.toISOString(),
        };

    const payload = {
      workspaceId,
      projectId: task.project?._id ?? "",
      taskId: task._id,
      data: formData,
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
        toast({
          title: "Success",
          description: isStatusOnlyMode
            ? "Task status updated successfully"
            : "Task updated successfully",
          variant: "success",
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <div className="mb-5 pb-2 border-b">
          <h1 className="text-xl font-semibold text-center sm:text-left">
            {isStatusOnlyMode ? "Update Task Status" : "Edit Task"}
          </h1>
        </div>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            {!isStatusOnlyMode ? (
              <>
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl><Input {...field} placeholder="Task title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl><Textarea {...field} rows={2} placeholder="Description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="assignedTo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <TaskAssigneeMultiSelect
                        options={membersOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select one or more assignees"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline">
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            ) : null}

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {!isStatusOnlyMode ? (
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            ) : null}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader className="animate-spin" />}
              {isStatusOnlyMode ? "Submit Status Update" : "Save Changes"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

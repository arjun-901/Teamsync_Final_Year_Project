import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { TaskType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import EditTaskDialog from "../edit-task-dialog"; // Import the Edit Dialog
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false); // State for edit dialog

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { hasPermission, user } = useAuthContext();
  const canEditTask = hasPermission(Permissions.EDIT_TASK);
  const canDeleteTask = hasPermission(Permissions.DELETE_TASK);
  const canUpdateOwnTaskStatus = row.original.assignedTo?._id === user?._id;
  const canOpenTaskEditor = canEditTask || canUpdateOwnTaskStatus;

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });

  const task = row.original;
  const taskId = task._id as string;
  const taskCode = task.taskCode;

  if (!canOpenTaskEditor && !canDeleteTask) {
    return null;
  }

  const handleConfirm = () => {
    mutate(
      { workspaceId, taskId },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
          toast({ title: "Success", description: data.message, variant: "success" });
          setTimeout(() => setOpenDialog(false), 100);
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {canOpenTaskEditor ? (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setOpenEditDialog(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              {canEditTask ? "Edit Task" : "Update Status"}
            </DropdownMenuItem>
          ) : null}
          {canOpenTaskEditor && canDeleteTask ? <DropdownMenuSeparator /> : null}

          {canDeleteTask ? (
            <DropdownMenuItem
              className="!text-destructive cursor-pointer"
              onClick={() => setOpenDialog(true)}
            >
              Delete Task
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canOpenTaskEditor ? (
        <EditTaskDialog
          task={task}
          isOpen={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
        />
      ) : null}

      {canDeleteTask ? (
        <ConfirmDialog
          isOpen={openDeleteDialog}
          isLoading={isPending}
          onClose={() => setOpenDialog(false)}
          onConfirm={handleConfirm}
          title="Delete Task"
          description={`Are you sure you want to delete ${taskCode}?`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      ) : null}
    </>
  );
}

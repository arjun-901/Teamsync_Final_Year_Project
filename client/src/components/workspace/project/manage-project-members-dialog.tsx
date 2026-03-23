import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectMembers from "@/hooks/api/use-get-project-members";
import { updateProjectMembersMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

const ManageProjectMembersDialog = ({ projectId }: { projectId: string }) => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { data, isPending } = useGetProjectMembers({
    workspaceId,
    projectId,
    skip: !open,
  });

  useEffect(() => {
    if (!data?.members) return;

    setSelectedMembers(
      data.members
        .filter((member) => member.isProjectMember)
        .map((member) => member.userId._id)
    );
  }, [data]);

  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: updateProjectMembersMutationFn,
  });

  const toggleMember = (memberId: string) => {
    setSelectedMembers((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const handleSave = () => {
    mutate(
      {
        workspaceId,
        projectId,
        memberIds: selectedMembers,
      },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries({
            queryKey: ["project-members", workspaceId, projectId],
          });
          queryClient.invalidateQueries({
            queryKey: ["project-chat", workspaceId, projectId],
          });
          toast({
            title: "Success",
            description: response.message,
            variant: "success",
          });
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="size-4" />
          Manage Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
          <DialogDescription>
            Manager/admin is project ke liye alag team choose kar sakte hain.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-2">
          {isPending ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading members...
            </div>
          ) : (
            data?.members?.map((member) => {
              const name = member.userId.name;
              const initials = getAvatarFallbackText(name);
              const avatarColor = getAvatarColor(name);

              return (
                <label
                  key={member.userId._id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3"
                >
                  <Checkbox
                    checked={selectedMembers.includes(member.userId._id)}
                    onCheckedChange={() => toggleMember(member.userId._id)}
                  />
                  <Avatar className="size-10">
                    <AvatarImage src={member.userId.profilePicture || ""} />
                    <AvatarFallback className={avatarColor}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.userId.email} • {member.role.name}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            Save Members
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageProjectMembersDialog;

import { useState } from "react";
import { Copy, Loader2, Link as LinkIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { createProjectInviteMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ProjectInviteDialog = ({ projectId }: { projectId: string }) => {
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: createProjectInviteMutationFn,
  });

  const handleGenerate = () => {
    mutate(
      {
        workspaceId,
        projectId,
      },
      {
        onSuccess: (response) => {
          setInviteUrl(response.inviteUrl);
          toast({
            title: "Invite ready",
            description: "Project invite link generate ho gaya hai.",
            variant: "success",
          });
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

  const handleCopy = async () => {
    if (!inviteUrl) return;

    await navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Copied",
      description: "Invite link clipboard me copy ho gaya.",
      variant: "success",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setInviteUrl("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LinkIcon className="size-4" />
          Invite Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Project Invite</DialogTitle>
          <DialogDescription>
            Is link se aane wala user signup/login ke baad direct workspace aur
            selected project me join ho jayega.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Generate Invite Link
          </Button>

          {inviteUrl ? (
            <div className="rounded-xl border p-3">
              <p className="break-all text-sm text-muted-foreground">
                {inviteUrl}
              </p>
              <Button className="mt-3" variant="secondary" onClick={() => void handleCopy()}>
                <Copy className="size-4" />
                Copy Link
              </Button>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectInviteDialog;

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/context/auth-provider";
import { toast } from "@/hooks/use-toast";
import { CheckIcon, CopyIcon, Loader, Loader2 } from "lucide-react";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import { useMutation } from "@tanstack/react-query";
import { createProjectInviteMutationFn } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InviteMember = () => {
  const { workspaceLoading } = useAuthContext();
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();
  const [copied, setCopied] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize: 100,
    pageNumber: 1,
    skip: !workspaceId,
  });

  const projects = projectsData?.projects || [];
  const hasAtLeastOneProject =
    (projectsData?.pagination?.totalCount ?? 0) > 0 ||
    projects.length > 0;

  const selectedProjectName = useMemo(
    () => projects.find((project) => project._id === selectedProjectId)?.name,
    [projects, selectedProjectId]
  );

  const { mutate: generateInvite, isPending: isGeneratingInvite } = useMutation(
    {
      mutationFn: createProjectInviteMutationFn,
    }
  );

  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId("");
      return;
    }

    if (!selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    setInviteUrl("");
    setCopied(false);
  }, [selectedProjectId]);

  const handleGenerateInvite = () => {
    if (!selectedProjectId) {
      toast({
        title: "Project required",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return;
    }

    generateInvite(
      {
        workspaceId,
        projectId: selectedProjectId,
      },
      {
        onSuccess: (response) => {
          setInviteUrl(response.inviteUrl);
          toast({
            title: "Invite ready",
            description: selectedProjectName
              ? `Invite link generated for ${selectedProjectName}.`
              : "Project invite link generated successfully.",
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

  const handleCopy = () => {
    if (!inviteUrl || !hasAtLeastOneProject) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      toast({
        title: "Copied",
        description: "The project invite URL has been copied to your clipboard.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inviteInputValue = !hasAtLeastOneProject
    ? "Create at least one project to enable invite link sharing."
    : inviteUrl || "Select a project and generate an invite link.";

  const copyDisabled =
    !hasAtLeastOneProject || !inviteUrl || isGeneratingInvite || workspaceLoading;

  const generateDisabled =
    !hasAtLeastOneProject || !selectedProjectId || isGeneratingInvite || workspaceLoading;

  return (
    <div className="flex flex-col pt-0.5 px-0 ">
      <h5 className="text-lg  leading-[30px] font-semibold mb-1">
        Invite members to join you
      </h5>
      <p className="text-sm text-muted-foreground leading-tight">
        Generate a project-specific invite link so new members join the correct
        project.
      </p>
      {!workspaceLoading && !hasAtLeastOneProject && (
        <p className="text-sm text-amber-700 mt-2">
          Please create at least one project before sharing the invite link.
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 ml-1 text-sm font-semibold"
            onClick={onOpen}
          >
            Create project
          </Button>
        </p>
      )}

      <PermissionsGuard showMessage requiredPermission={Permissions.ADD_MEMBER}>
        {workspaceLoading ? (
          <Loader
            className="w-8 h-8 
        animate-spin
        place-self-center
        flex"
          />
        ) : (
          <div className="py-3 space-y-2">
            <Label htmlFor="project-select">Project</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={!hasAtLeastOneProject || isGeneratingInvite}
            >
              <SelectTrigger id="project-select">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.emoji} {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleGenerateInvite}
                disabled={generateDisabled}
              >
                {isGeneratingInvite && <Loader2 className="size-4 animate-spin" />}
                Generate Invite Link
              </Button>
            </div>

            <div className="flex gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                disabled={true}
                className="disabled:opacity-100 disabled:pointer-events-none disabled:text-muted-foreground"
                value={inviteInputValue}
                readOnly
              />
              <Button
                disabled={copyDisabled}
                className="shrink-0"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
          </div>
        )}
      </PermissionsGuard>
    </div>
  );
};

export default InviteMember;

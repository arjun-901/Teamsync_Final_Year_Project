import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarClock,
  Copy,
  Plus,
  Square,
  Trash2,
  Video,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import {
  createMeetingMutationFn,
  deleteMeetingMutationFn,
  endMeetingMutationFn,
  getWorkspaceMeetingsQueryFn,
  startMeetingMutationFn,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const workspaceId = useWorkspaceId();
  const { user, workspace } = useAuthContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["meetings", workspaceId],
    queryFn: () => getWorkspaceMeetingsQueryFn(workspaceId),
    enabled: !!workspaceId,
    refetchInterval: 3000,
  });

  const createMutation = useMutation({
    mutationFn: createMeetingMutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
      setOpen(false);
      toast({
        title: "Meeting created",
        description: "Scheduled meeting successfully create ho gayi.",
      });
    },
  });

  const startMutation = useMutation({
    mutationFn: startMeetingMutationFn,
    onSuccess: async (response: any) => {
      await queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
      if (response?.meeting?._id) {
        navigate(`/workspace/${workspaceId}/meetings/${response.meeting._id}`);
      }
    },
  });

  const endMutation = useMutation({
    mutationFn: endMeetingMutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
      toast({
        title: "Meeting ended",
        description: "Live call successfully end ho gayi.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMeetingMutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
      toast({
        title: "Meeting deleted",
        description: "Meeting record remove kar diya gaya hai.",
      });
    },
  });

  const meetings = data?.meetings || [];

  const role = useMemo(() => {
    if (!workspace || !user) return null;
    if ((workspace as any).owner === user._id) return "OWNER";
    const member = (workspace as any).members?.find(
      (item: any) => item.userId._id === user._id
    );
    return member?.role?.name || null;
  }, [workspace, user]);

  const canManage = role === "OWNER" || role === "ADMIN";

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meetings</h2>
          <p className="text-muted-foreground">
            Stream powered workspace video calls for managers and members.
          </p>
        </div>

        {canManage ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Meeting</DialogTitle>
              </DialogHeader>
              <CreateMeetingForm
                onCreate={(payload: any) => createMutation.mutate(payload)}
                workspaceId={workspaceId}
              />
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading meetings...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-red-500">Error loading meetings: {error?.message}</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              No meetings yet. Create one to get started!
            </p>
          </div>
        ) : (
          meetings.map((meeting: any) => (
            <Card key={meeting._id} className="overflow-hidden">
              <CardHeader className="py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base leading-6">
                          {meeting.title}
                        </CardTitle>
                        {meeting.description ? (
                          <CardDescription className="line-clamp-2 text-sm">
                            {meeting.description}
                          </CardDescription>
                        ) : null}
                      </div>
                      <Badge
                        className="capitalize"
                        variant={
                          meeting.status === "live"
                            ? "destructive"
                            : meeting.status === "ended"
                              ? "outline"
                              : "default"
                        }
                      >
                        {meeting.status}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {format(new Date(meeting.scheduledAt), "PPpp")}
                      </span>
                      <span>Duration: {meeting.duration} min</span>
                      {meeting.startedAt ? (
                        <span>Started: {format(new Date(meeting.startedAt), "PPpp")}</span>
                      ) : null}
                      {meeting.endedAt ? (
                        <span>Ended: {format(new Date(meeting.endedAt), "PPpp")}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await navigator.clipboard.writeText(meeting.joinUrl);
                        toast({
                          title: "Invite link copied",
                          description: "Meeting link clipboard mein copy ho gaya hai.",
                        });
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>

                    {meeting.status === "live" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/workspace/${workspaceId}/meetings/${meeting._id}`)
                        }
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Join Now
                      </Button>
                    ) : null}

                    {meeting.status !== "live" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(`/workspace/${workspaceId}/meetings/${meeting._id}`)
                        }
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Open Room
                      </Button>
                    ) : null}

                    {canManage && meeting.status === "scheduled" ? (
                      <Button
                        size="sm"
                        onClick={() => startMutation.mutate(meeting._id)}
                      >
                        Start Live
                      </Button>
                    ) : null}

                    {canManage && meeting.status === "live" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => endMutation.mutate(meeting._id)}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        End
                      </Button>
                    ) : null}

                    {canManage ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(meeting._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}

                    {!canManage && meeting.status !== "live" ? (
                      <span className="text-xs text-muted-foreground">
                        Manager ke live start karte hi aap join kar sakte ho.
                      </span>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </main>
  );
};

const CreateMeetingForm: React.FC<{
  workspaceId: string;
  onCreate: (data: any) => void;
}> = ({ workspaceId, onCreate }) => {
  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize: 100,
    pageNumber: 1,
    skip: !workspaceId,
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(30);

  const projects = projectsData?.projects || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      toast({
        title: "Project required",
        description: "Meeting create karne se pehle project select kijiye.",
        variant: "destructive",
      });
      return;
    }

    const scheduledAtISO = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    onCreate({
      workspaceId,
      projectId,
      title,
      description,
      scheduledAt: scheduledAtISO,
      duration,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Project</Label>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Select project for this call" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                {project.emoji} {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1 text-xs text-muted-foreground">
          Sirf isi project ke selected members call join kar payenge.
        </p>
      </div>
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <Label>Scheduled At</Label>
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        Create Meeting
      </Button>
    </form>
  );
};

export default MeetingsPage;

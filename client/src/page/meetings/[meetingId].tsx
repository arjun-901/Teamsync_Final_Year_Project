import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  Copy,
  Loader2,
  Minimize2,
  Video,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/context/auth-provider";
import {
  endMeetingMutationFn,
  getMeetingByIdQueryFn,
  getMeetingStreamCredentialsQueryFn,
  startMeetingMutationFn,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useMeetingSession } from "@/context/meeting-provider";

const MeetingRoom: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { meetingId, workspaceId } = useParams();
  const { user, workspace } = useAuthContext();
  const { openMeetingSession, toggleMeetingView, closeMeetingSession } =
    useMeetingSession();
  const [sessionClosed, setSessionClosed] = useState(false);

  const role = useMemo(() => {
    if (!workspace || !user) return null;
    if ((workspace as any).owner === user._id) return "OWNER";
    const member = (workspace as any).members?.find(
      (item: any) => item.userId._id === user._id
    );
    return member?.role?.name || null;
  }, [workspace, user]);

  const canManage = role === "OWNER" || role === "ADMIN";

  const {
    data: meetingResp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => getMeetingByIdQueryFn(meetingId as string),
    enabled: !!meetingId,
  });

  const meeting = meetingResp?.meeting;

  const { data: credentialsResp } = useQuery({
    queryKey: ["meeting-stream", meetingId, meeting?.status],
    queryFn: () => getMeetingStreamCredentialsQueryFn(meetingId as string),
    enabled: !!meetingId && meeting?.status === "live",
  });

  useEffect(() => {
    if (meeting?.status === "live" && credentialsResp?.credentials && !sessionClosed) {
      openMeetingSession({
        meeting,
        credentials: credentialsResp.credentials,
        canManage,
        onLeave: () => {
          setSessionClosed(true);
          navigate(`/workspace/${workspaceId}/meetings`);
        },
      });
    }
  }, [
    meeting,
    credentialsResp,
    canManage,
    navigate,
    openMeetingSession,
    sessionClosed,
    workspaceId,
  ]);

  useEffect(() => {
    if (meeting?.status !== "live") {
      setSessionClosed(false);
      closeMeetingSession();
    }
  }, [meeting?.status, closeMeetingSession]);

  const startMutation = useMutation({
    mutationFn: startMeetingMutationFn,
    onSuccess: async () => {
      setSessionClosed(false);
      await queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
      await queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
    },
  });

  const endMutation = useMutation({
    mutationFn: endMeetingMutationFn,
    onSuccess: async () => {
      closeMeetingSession();
      await queryClient.invalidateQueries({ queryKey: ["meeting", meetingId] });
      await queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
      toast({
        title: "Meeting ended",
        description: "Live call successfully end ho gayi.",
      });
      navigate(`/workspace/${workspaceId}/meetings`);
    },
  });

  if (!meetingId || !workspaceId) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Loading meeting room...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error || !meeting) {
    return (
      <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Meeting not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {(error as Error | undefined)?.message || "Meeting load nahi ho paayi."}
            </p>
            <Button onClick={() => navigate(`/workspace/${workspaceId}/meetings`)}>
              Back to meetings
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (meeting.status === "scheduled") {
    return (
      <main className="space-y-4">
        <Button
          variant="ghost"
          className="pl-0"
          onClick={() => navigate(`/workspace/${workspaceId}/meetings`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to meetings
        </Button>

        <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#071226_0%,#0f1d3a_50%,#173059_100%)] text-white shadow-xl">
          <CardHeader className="space-y-3">
            <Badge className="w-fit border-0 bg-white/10 text-white hover:bg-white/10">
              Scheduled
            </Badge>
            <CardTitle className="text-3xl">{meeting.title}</CardTitle>
            <p className="max-w-2xl text-sm text-slate-200">
              {meeting.description || "Meeting ready hai. Start karte hi sab members live room join kar sakenge."}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-sm text-slate-200">
              <p className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                {format(new Date(meeting.scheduledAt), "PPpp")}
              </p>
              <p>Duration: {meeting.duration} minutes</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20"
                onClick={async () => {
                  await navigator.clipboard.writeText(meeting.joinUrl);
                  toast({
                    title: "Invite link copied",
                    description: "Meeting link clipboard mein copy ho gaya hai.",
                  });
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy invite
              </Button>
              {canManage ? (
                <Button onClick={() => startMutation.mutate(meeting._id)}>
                  <Video className="mr-2 h-4 w-4" />
                  {startMutation.isPending ? "Starting..." : "Start live"}
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  Waiting for manager
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (meeting.status === "ended") {
    return (
      <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Badge className="w-fit" variant="outline">
              Ended
            </Badge>
            <CardTitle>{meeting.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Yeh meeting end ho chuki hai. Nayi live call ke liye meetings page se dobara start ya create karein.
            </p>
            <Button onClick={() => navigate(`/workspace/${workspaceId}/meetings`)}>
              Back to meetings
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!credentialsResp?.credentials) {
    return (
      <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Preparing Stream room...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <Button
        variant="ghost"
        className="pl-0"
        onClick={() => navigate(`/workspace/${workspaceId}/meetings`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to meetings
      </Button>

      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#071226_0%,#0f1d3a_50%,#173059_100%)] text-white shadow-xl">
        <CardHeader className="space-y-3">
          <Badge className="w-fit border-0 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/20">
            Live
          </Badge>
          <CardTitle className="text-3xl">{meeting.title}</CardTitle>
          <p className="max-w-2xl text-sm text-slate-200">
            Meeting active hai. Aap is call ko minimize karke app ke kisi bhi route par kaam kar sakte ho, call disconnect nahi hogi.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={toggleMeetingView}>
            <Minimize2 className="mr-2 h-4 w-4" />
            Minimize / Expand call
          </Button>
          {canManage ? (
            <Button
              variant="destructive"
              onClick={() => endMutation.mutate(meeting._id)}
              disabled={endMutation.isPending}
            >
              End live meeting
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
};

export default MeetingRoom;

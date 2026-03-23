import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CallControls,
  CallParticipantsList,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  Copy,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  PhoneOff,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type StreamCredentials = {
  apiKey: string;
  token: string;
  user: {
    id: string;
    name?: string;
    image?: string;
  };
  callType: string;
  callId: string;
};

type MeetingRoomProps = {
  meeting: {
    _id: string;
    title: string;
    description?: string;
    status: string;
    joinUrl?: string;
  };
  credentials: StreamCredentials;
  canManage: boolean;
  onLeave: () => void;
  onEndMeeting?: () => void;
  isEnding?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
};

const formatDuration = (startedAt?: Date) => {
  if (!startedAt) return "00:00";

  const totalSeconds = Math.max(
    0,
    Math.floor((Date.now() - startedAt.getTime()) / 1000)
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds]
      .map((value) => value.toString().padStart(2, "0"))
      .join(":");
  }

  return [minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
};

const copyInviteLink = async (joinUrl?: string) => {
  if (!joinUrl) return;

  await navigator.clipboard.writeText(joinUrl);
  toast({
    title: "Invite link copied",
    description: "Meeting link clipboard mein copy ho gaya hai.",
  });
};

const MeetingCompactBar: React.FC<{
  title: string;
  onLeave: () => void;
  onToggleExpanded?: () => void;
}> = ({ title, onLeave, onToggleExpanded }) => {
  const call = useCall();
  const { useParticipantCount, useCallStartedAt } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const startedAt = useCallStartedAt();
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    setElapsed(formatDuration(startedAt ? new Date(startedAt) : undefined));

    const interval = window.setInterval(() => {
      setElapsed(formatDuration(startedAt ? new Date(startedAt) : undefined));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  const handleLeave = async () => {
    try {
      await call?.leave();
    } catch (error) {
      console.error("Unable to leave call", error);
    }

    onLeave();
  };

  return (
    <div className="w-[360px] rounded-3xl border border-white/10 bg-[#0a1020]/95 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-xs text-slate-300">
            Live call active • {participantCount || 1} participant • {elapsed}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="border-0 bg-white/10 text-white hover:bg-white/20"
            onClick={onToggleExpanded}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => void handleLeave()}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MeetingCallContent: React.FC<
  Pick<
    MeetingRoomProps,
    | "meeting"
    | "canManage"
    | "onLeave"
    | "onEndMeeting"
    | "isEnding"
    | "onToggleExpanded"
  >
> = ({
  meeting,
  canManage,
  onLeave,
  onEndMeeting,
  isEnding,
  onToggleExpanded,
}) => {
  const call = useCall();
  const {
    useCallCallingState,
    useParticipantCount,
    useCallStartedAt,
    useParticipants,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const participants = useParticipants();
  const startedAt = useCallStartedAt();
  const [showSidebar, setShowSidebar] = useState(true);
  const [elapsed, setElapsed] = useState("00:00");
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinAttemptedRef = useRef(false);

  useEffect(() => {
    let active = true;

    const initializeCall = async () => {
      if (!call || joinAttemptedRef.current) return;

      joinAttemptedRef.current = true;
      setJoinError(null);

      try {
        await call.getOrCreate();
        await call.join({ create: true });

        try {
          await call.camera.enable();
        } catch (error) {
          console.error("Unable to enable camera", error);
        }

        try {
          await call.microphone.enable();
        } catch (error) {
          console.error("Unable to enable microphone", error);
        }
      } catch (error) {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : "Stream room join nahi ho paaya.";

        setJoinError(message);
        toast({
          title: "Unable to join call",
          description: message,
          variant: "destructive",
        });
      }
    };

    if (
      call &&
      callingState !== CallingState.JOINED &&
      callingState !== CallingState.JOINING
    ) {
      void initializeCall();
    }

    return () => {
      active = false;
    };
  }, [call, callingState]);

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      joinAttemptedRef.current = false;
    }
  }, [callingState]);

  useEffect(() => {
    setElapsed(formatDuration(startedAt ? new Date(startedAt) : undefined));

    const interval = window.setInterval(() => {
      setElapsed(formatDuration(startedAt ? new Date(startedAt) : undefined));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  const showGrid = participants.length > 2;

  return (
    <StreamTheme className="teamsync-stream-theme h-full">
      <main className="flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#050816] text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0a1020] px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Stream Video Calling
            </p>
            <h1 className="truncate text-lg font-semibold">{meeting.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="border-0 bg-white/10 text-white hover:bg-white/10">
              <Users className="mr-1 h-3.5 w-3.5" />
              {participantCount || participants.length || 1}
            </Badge>
            <Badge className="border-0 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">
              {elapsed}
            </Badge>
            <Button
              size="icon"
              variant="secondary"
              className="border-0 bg-white/10 text-white hover:bg-white/20"
              onClick={onToggleExpanded}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            {canManage && onEndMeeting ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={onEndMeeting}
                disabled={isEnding}
              >
                End meeting
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden p-4">
          <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#09111f]">
            {callingState !== CallingState.JOINED ? (
              <div className="flex h-full min-h-[520px] items-center justify-center p-6">
                <Card className="w-full max-w-md border-white/10 bg-white/5 text-white">
                  <CardHeader>
                    <CardTitle>
                      {joinError ? "Call connection failed" : "Joining Stream room..."}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-300">
                    <p>
                      {joinError ||
                        "Camera aur mic auto start karne ki koshish ho rahi hai."}
                    </p>
                    {joinError ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            joinAttemptedRef.current = false;
                            setJoinError(null);
                          }}
                        >
                          Retry
                        </Button>
                        <Button variant="secondary" onClick={onLeave}>
                          Back
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-full min-h-[520px]">
                {showGrid ? (
                  <PaginatedGridLayout />
                ) : (
                  <SpeakerLayout
                    participantsBarPosition="left"
                    participantsBarLimit={4}
                  />
                )}
              </div>
            )}
          </div>

          <aside
            className={cn(
              "hidden w-full max-w-[340px] flex-col gap-4 overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1324] p-4 lg:flex",
              showSidebar && "lg:flex",
              !showSidebar && "lg:hidden"
            )}
          >
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">Your meeting is live!</CardTitle>
                <p className="text-sm text-slate-300">
                  Invite link copy karke members ko room join karwa sakte ho.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-[#1d4ed8] hover:bg-[#1e40af]"
                  onClick={() => void copyInviteLink(meeting.joinUrl)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy invite link
                </Button>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Call ID
                  </p>
                  <p className="mt-2 break-all font-medium text-white">
                    {meeting._id}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              <CallParticipantsList onClose={() => setShowSidebar(false)} />
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-[#0a1020] px-4 py-4">
          <div className="rounded-full bg-black/30 px-3 py-2">
            <CallControls onLeave={onLeave} />
          </div>

          <Button
            variant="secondary"
            className="border-0 bg-white/10 text-white hover:bg-white/20"
            onClick={() => setShowSidebar((value) => !value)}
          >
            {showSidebar ? (
              <PanelRightClose className="mr-2 h-4 w-4" />
            ) : (
              <PanelRightOpen className="mr-2 h-4 w-4" />
            )}
            Participants
          </Button>
        </div>
      </main>
    </StreamTheme>
  );
};

const StreamMeetingRoom: React.FC<MeetingRoomProps> = ({
  meeting,
  credentials,
  canManage,
  onLeave,
  onEndMeeting,
  isEnding,
  isExpanded = true,
  onToggleExpanded,
}) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const nextClient = new StreamVideoClient(credentials.apiKey, {
      options: { logLevel: "debug" },
    } as any);

    const setupClient = async () => {
      try {
        setClientError(null);
        setClientReady(false);

        await nextClient.connectUser(credentials.user, credentials.token);

        if (!active) {
          await nextClient.disconnectUser();
          return;
        }

        setClient(nextClient);
        setClientReady(true);
      } catch (error) {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : "Stream client initialize nahi ho paaya.";
        setClientError(message);
        toast({
          title: "Video setup failed",
          description: message,
          variant: "destructive",
        });
      }
    };

    void setupClient();

    return () => {
      active = false;
      setClientReady(false);
      setClient(null);
      void nextClient.disconnectUser();
    };
  }, [credentials]);

  const call = useMemo(() => {
    if (!client || !clientReady) return null;
    return client.call(credentials.callType, credentials.callId);
  }, [client, clientReady, credentials.callId, credentials.callType]);

  if (clientError) {
    return (
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 text-white">
        <p className="text-sm">{clientError}</p>
      </div>
    );
  }

  if (!client || !call || !clientReady) {
    return (
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950 p-4 text-white">
        Connecting Stream client...
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        {isExpanded ? (
          <div className="fixed inset-4 z-[80]">
            <MeetingCallContent
              meeting={meeting}
              canManage={canManage}
              onLeave={onLeave}
              onEndMeeting={onEndMeeting}
              isEnding={isEnding}
              onToggleExpanded={onToggleExpanded}
            />
          </div>
        ) : (
          <div className="fixed bottom-4 right-4 z-[80]">
            <MeetingCompactBar
              title={meeting.title}
              onLeave={onLeave}
              onToggleExpanded={onToggleExpanded}
            />
          </div>
        )}
      </StreamCall>
    </StreamVideo>
  );
};

export default StreamMeetingRoom;

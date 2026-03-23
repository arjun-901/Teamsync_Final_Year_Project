import React, { createContext, useContext, useMemo, useState } from "react";
import StreamMeetingRoom from "@/components/video/StreamMeetingRoom";

type MeetingSession = {
  meeting: any;
  credentials: any;
  canManage: boolean;
  onLeave?: () => void;
};

type MeetingContextType = {
  session: MeetingSession | null;
  isExpanded: boolean;
  openMeetingSession: (session: MeetingSession) => void;
  closeMeetingSession: () => void;
  toggleMeetingView: () => void;
};

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<MeetingSession | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const value = useMemo<MeetingContextType>(
    () => ({
      session,
      isExpanded,
      openMeetingSession: (nextSession) => {
        const isSameSession =
          session &&
          session.meeting?._id === nextSession.meeting?._id &&
          session.credentials?.callId === nextSession.credentials?.callId;

        setSession((current) => {
          if (
            current &&
            current.meeting?._id === nextSession.meeting?._id &&
            current.credentials?.callId === nextSession.credentials?.callId
          ) {
            return current;
          }
          return nextSession;
        });
        if (!isSameSession) {
          setIsExpanded(true);
        }
      },
      closeMeetingSession: () => {
        setSession(null);
        setIsExpanded(true);
      },
      toggleMeetingView: () => {
        setIsExpanded((value) => !value);
      },
    }),
    [isExpanded, session]
  );

  return (
    <MeetingContext.Provider value={value}>
      {children}
      {session ? (
        <StreamMeetingRoom
          meeting={session.meeting}
          credentials={session.credentials}
          canManage={session.canManage}
          onLeave={() => {
            session.onLeave?.();
            setSession(null);
            setIsExpanded(true);
          }}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded((value) => !value)}
        />
      ) : null}
    </MeetingContext.Provider>
  );
};

export const useMeetingSession = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeetingSession must be used within MeetingProvider");
  }
  return context;
};

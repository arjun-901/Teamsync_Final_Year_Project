/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect } from "react";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useAuth from "@/hooks/api/use-auth";
import { UserType, WorkspaceType } from "@/types/api.type";
import useGetWorkspaceQuery from "@/hooks/api/use-get-workspace";
import { useLocation, useNavigate } from "react-router-dom";
import usePermissions from "@/hooks/use-permissions";
import { PermissionType } from "@/constant";

// Define the context shape
type AuthContextType = {
  user?: UserType;
  workspace?: WorkspaceType;
  hasPermission: (permission: PermissionType) => boolean;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  workspaceLoading: boolean;
  refetchAuth: () => void;
  refetchWorkspace: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const workspaceId = useWorkspaceId();

  const {
    data: authData,
    error: authError,
    isLoading,
    isFetching,
    refetch: refetchAuth,
  } = useAuth();
  const user = authData?.user;

  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceQuery(workspaceId);

  const workspace = workspaceData?.workspace;

  useEffect(() => {
    if (workspaceError) {
      if (workspaceError?.errorCode === "ACCESS_UNAUTHORIZED") {
        navigate("/"); // Redirect if the user is not a member of the workspace
      }
    }
  }, [navigate, workspaceError]);

  useEffect(() => {
    if (!workspaceId || !user?._id) return;

    const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (!base) return;

    const url = `${base}/meetings/workspace/${workspaceId}/events`;

    let es: EventSource | null = null;
    try {
      es = new EventSource(url, { withCredentials: true } as any);
    } catch {
      return;
    }

    const onCreated = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data || "{}");
        const meetingId = payload?.meetingId;
        if (!meetingId) return;

        const targetPath = `/workspace/${workspaceId}/meetings/${meetingId}`;
        if (location.pathname === targetPath) return;

        // avoid redirect loops if server re-sends buffered events
        const key = `last_meeting_redirect_${workspaceId}`;
        const last = window.localStorage.getItem(key);
        if (last === meetingId) return;
        window.localStorage.setItem(key, meetingId);

        navigate(targetPath);
      } catch {
        // ignore
      }
    };

    const onLive = (event: MessageEvent) => {
      // optional: could show toast; for now just ignore (room will poll status)
      void event;
    };

    es.addEventListener("meeting.created", onCreated as any);
    es.addEventListener("meeting.live", onLive as any);

    es.onerror = () => {
      // browser will auto-retry; keep it open
    };

    return () => {
      try {
        es?.close();
      } catch {
        // ignore
      }
    };
  }, [workspaceId, user?._id, navigate, location.pathname]);

  const permissions = usePermissions(user, workspace);

  const hasPermission = (permission: PermissionType): boolean => {
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        hasPermission,
        error: authError || workspaceError,
        isLoading,
        isFetching,
        workspaceLoading,
        refetchAuth,
        refetchWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useCurrentUserContext must be used within a AuthProvider");
  }
  return context;
};

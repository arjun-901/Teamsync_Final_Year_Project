const envBaseURL = import.meta.env.VITE_API_BASE_URL;
const isBrowser = typeof window !== "undefined";
const isLocalDevelopment =
  isBrowser &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const baseURL =
  isLocalDevelopment && envBaseURL ? envBaseURL : "/api";
export const appURL = import.meta.env.VITE_APP_URL || window.location.origin;
export const workspaceInvitePath =
  import.meta.env.VITE_WORKSPACE_INVITE_PATH ||
  "/invite/workspace/:inviteCode/join";

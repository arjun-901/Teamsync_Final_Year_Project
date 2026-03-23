export const baseURL = import.meta.env.VITE_API_BASE_URL;
export const appURL = import.meta.env.VITE_APP_URL || window.location.origin;
export const workspaceInvitePath =
  import.meta.env.VITE_WORKSPACE_INVITE_PATH ||
  "/invite/workspace/:inviteCode/join";

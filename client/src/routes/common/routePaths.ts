export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  PROFILE: "/workspace/:workspaceId/profile",
  TASKS: "/workspace/:workspaceId/tasks",
  MEMBERS: "/workspace/:workspaceId/members",
  SETTINGS: "/workspace/:workspaceId/settings",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
  PROJECT_CHAT: "/workspace/:workspaceId/project/:projectId/chat",
  MEETINGS: "/workspace/:workspaceId/meetings",
  MEETING_ROOM: "/workspace/:workspaceId/meetings/:meetingId",
};

export const BASE_ROUTE = {
  HOME: "/",
  ABOUT_US: "/about",
  CONTACT_US: "/contact",
  INVITE_URL: "/invite/workspace/:inviteCode/join",
  PROJECT_INVITE_URL: "/invite/project/:token/join",
  TERMS_OF_SERVICE: "/terms",
  PRIVACY_POLICY: "/privacy",
};

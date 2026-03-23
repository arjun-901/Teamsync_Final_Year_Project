import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI", ""),

  SESSION_SECRET: getEnv("SESSION_SECRET"),
  SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN"),

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
  FRONTEND_APP_URL: getEnv("FRONTEND_APP_URL", "http://localhost:3000"),
  FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL"),
  FRONTEND_WORKSPACE_INVITE_PATH: getEnv(
    "FRONTEND_WORKSPACE_INVITE_PATH",
    "/invite/workspace/:inviteCode/join"
  ),
  FRONTEND_PROJECT_INVITE_PATH: getEnv(
    "FRONTEND_PROJECT_INVITE_PATH",
    "/invite/project/:token/join"
  ),
  FRONTEND_MEETING_ROOM_PATH: getEnv(
    "FRONTEND_MEETING_ROOM_PATH",
    "/workspace/:workspaceId/meetings/:meetingId"
  ),
  STREAM_API_KEY: getEnv("STREAM_API_KEY", ""),
  STREAM_API_SECRET: getEnv("STREAM_API_SECRET", ""),
  STREAM_CALL_TYPE: getEnv("STREAM_CALL_TYPE", "default"),
  STREAM_TIMEOUT: Number(getEnv("STREAM_TIMEOUT", "15000")),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
});

export const config = appConfig();

import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import {
  createMeetingController,
  getWorkspaceMeetingsController,
  getMeetingByIdController,
  startMeetingController,
  endMeetingController,
  workspaceMeetingEventsController,
  deleteMeetingController,
  getMeetingStreamCredentialsController,
} from "../controllers/meeting.controller";

const router = express.Router();

router.post("/", isAuthenticated, createMeetingController);
router.get(
  "/workspace/:workspaceId/events",
  isAuthenticated,
  workspaceMeetingEventsController
);
router.get("/workspace/:workspaceId", isAuthenticated, getWorkspaceMeetingsController);
router.get("/:meetingId", isAuthenticated, getMeetingByIdController);
router.get("/:meetingId/stream-token", isAuthenticated, getMeetingStreamCredentialsController);
router.post("/:meetingId/start", isAuthenticated, startMeetingController);
router.post("/:meetingId/end", isAuthenticated, endMeetingController);
router.delete("/:meetingId", isAuthenticated, deleteMeetingController);

export default router;

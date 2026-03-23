import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import * as meetingService from "../services/meeting.service";
import { HTTPSTATUS } from "../config/http.config";
import { createMeetingSchema } from "../validation/meeting.validation";
import { addWorkspaceSseClient } from "../services/meeting-events.service";

export const createMeetingController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const body = createMeetingSchema.parse({
    ...req.body,
  });
  const meeting = await meetingService.createMeeting(body, user);
  return res.status(HTTPSTATUS.CREATED).json({ message: "Meeting created", meeting });
});

export const getWorkspaceMeetingsController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { workspaceId } = req.params;
  const meetings = await meetingService.getWorkspaceMeetings(workspaceId, user);
  return res.status(HTTPSTATUS.OK).json({ meetings });
});

export const getMeetingByIdController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { meetingId } = req.params;
  const meeting = await meetingService.getMeetingById(meetingId, user);
  return res.status(HTTPSTATUS.OK).json({ meeting });
});

export const startMeetingController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { meetingId } = req.params;
  const meeting = await meetingService.startMeeting(meetingId, user);
  return res.status(HTTPSTATUS.OK).json({ message: "Meeting started", meeting });
});

export const endMeetingController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { meetingId } = req.params;
  const meeting = await meetingService.endMeeting(meetingId, user);
  return res.status(HTTPSTATUS.OK).json({ message: "Meeting ended", meeting });
});

export const deleteMeetingController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const { meetingId } = req.params;
  await meetingService.deleteMeeting(meetingId, user);
  return res.status(HTTPSTATUS.OK).json({ message: "Meeting deleted" });
});

export const getMeetingStreamCredentialsController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { meetingId } = req.params;
    const credentials = await meetingService.getMeetingStreamCredentials(
      meetingId,
      user
    );
    return res.status(HTTPSTATUS.OK).json({ credentials });
  }
);

export const workspaceMeetingEventsController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { workspaceId } = req.params;
    await meetingService.assertWorkspaceAccess(workspaceId, user);
    addWorkspaceSseClient(workspaceId, res);
  }
);

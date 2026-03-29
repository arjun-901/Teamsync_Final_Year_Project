import mongoose from "mongoose";
import MeetingModel from "../models/meeting.model";
import MemberModel from "../models/member.model";
import ProjectMemberModel from "../models/project-member.model";
import ProjectModel from "../models/project.model";
import { Roles } from "../enums/role.enum";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import { broadcastWorkspaceEvent } from "./meeting-events.service";
import { config } from "../config/app.config";
import {
  buildStreamUser,
  generateStreamUserToken,
  getStreamCallType,
  getStreamVideoClient,
} from "./stream-video.service";

const normalizeOrigin = (origin: string) => {
  const o = origin?.trim();
  if (!o) return "";
  if (o.startsWith("http://") || o.startsWith("https://")) return o;
  return `http://${o}`;
};

const getFrontendOrigin = () => {
  const fromEnv = process.env.FRONTEND_APP_URL || config.FRONTEND_APP_URL;
  return normalizeOrigin(fromEnv);
};

const getMeetingJoinUrl = (workspaceId: string, meetingId: string) => {
  const origin = getFrontendOrigin();
  if (!origin) return "";
  return `${origin}${config.FRONTEND_MEETING_ROOM_PATH.replace(
    ":workspaceId",
    workspaceId
  ).replace(":meetingId", meetingId)}`;
};

const generateMeetingId = () =>
  `teamsync-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

const getStreamCallInfo = (meeting: { roomId: string }) => ({
  apiKey: config.STREAM_API_KEY,
  callType: getStreamCallType(),
  callId: meeting.roomId,
});

const syncMeetingCall = async (
  meeting: any,
  memberIds: string[],
  actor: any
) => {
  if (!config.STREAM_API_KEY || !config.STREAM_API_SECRET) {
    return;
  }

  const client = getStreamVideoClient();
  const uniqueMemberIds = Array.from(new Set(memberIds.filter(Boolean)));

  await client.upsertUsers(
    uniqueMemberIds.map((userId) =>
      userId === actor._id.toString() ? buildStreamUser(actor) : { id: userId }
    )
  );

  const call = client.video.call(getStreamCallType(), meeting.roomId);
  await call.getOrCreate({
    data: {
      created_by_id: actor._id.toString(),
      starts_at: meeting.scheduledAt,
      members: uniqueMemberIds.map((userId) => ({ user_id: userId })),
      custom: {
        workspaceId: meeting.workspaceId.toString(),
        meetingId: meeting._id.toString(),
        title: meeting.title,
        description: meeting.description || "",
        duration: meeting.duration,
      },
    },
  });
};

const runStreamSyncSafely = async (
  action: string,
  handler: () => Promise<void>
) => {
  try {
    await handler();
  } catch (error) {
    console.error(`Stream sync failed during ${action}`, error);
  }
};

const mapMeetingResponse = (meeting: any) => ({
  ...meeting.toObject(),
  joinUrl: getMeetingJoinUrl(meeting.workspaceId.toString(), meeting.id),
  stream: getStreamCallInfo(meeting),
});

export const assertWorkspaceAccess = async (workspaceId: string, user: any) => {
  if (!user || !user._id) {
    throw new UnauthorizedException("Unauthorized. Please log in.");
  }

  const member = await MemberModel.findOne({ userId: user._id, workspaceId });
  if (!member) {
    throw new UnauthorizedException("User is not a member of workspace");
  }

  return member;
};

const assertMeetingParticipant = async (meeting: any, user: any) => {
  await assertWorkspaceAccess(meeting.workspaceId.toString(), user);

  const isParticipant = (meeting.participants || []).some(
    (participantId: mongoose.Types.ObjectId) =>
      participantId.toString() === user._id.toString()
  );

  if (!isParticipant) {
    throw new UnauthorizedException(
      "Only selected project members can join this meeting"
    );
  }
};

export const createMeeting = async (data: any, user: any) => {
  const session = await mongoose.startSession();
  let transactionCommitted = false;

  try {
    session.startTransaction();

    const { workspaceId, title, scheduledAt, duration } = data;

    if (!title || !scheduledAt || !duration) {
      throw new BadRequestException(
        "Missing required fields: title, scheduledAt, duration"
      );
    }

    const member = await MemberModel.findOne({ userId: user._id, workspaceId })
      .populate("role")
      .session(session);
    if (!member) {
      throw new UnauthorizedException("User is not a member of workspace");
    }

    const roleName = (member.role as any)?.name;
    if (roleName !== Roles.OWNER && roleName !== Roles.ADMIN) {
      throw new UnauthorizedException("Only OWNER or ADMIN can create meetings");
    }

    let participantIds: mongoose.Types.ObjectId[] = [];

    if (data.projectId) {
      const project = await ProjectModel.findOne({
        _id: data.projectId,
        workspace: workspaceId,
      }).session(session);

      if (!project) {
        throw new NotFoundException("Project not found for this workspace");
      }

      const projectMembers = await ProjectMemberModel.find({
        workspace: workspaceId,
        project: data.projectId,
      })
        .select("userId")
        .session(session);

      if (projectMembers.length === 0) {
        throw new BadRequestException(
          "Please add project members before creating a meeting"
        );
      }

      participantIds = Array.from(
        new Set(projectMembers.map((member) => member.userId.toString()))
      ).map((id) => new mongoose.Types.ObjectId(id));
    } else {
      const allMembers = await MemberModel.find({ workspaceId })
        .select("userId")
        .session(session);

      participantIds = Array.from(
        new Set(
          allMembers.map((m) => (m as any).userId?.toString()).filter(Boolean)
        )
      ).map((id) => new mongoose.Types.ObjectId(id));
    }

    if (!participantIds.some((id) => id.toString() === user._id.toString())) {
      participantIds.push(new mongoose.Types.ObjectId(user._id.toString()));
    }

    const meeting = new MeetingModel({
      workspaceId,
      projectId: data.projectId || null,
      title: data.title,
      description: data.description || "",
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration,
      createdBy: user._id,
      roomId: generateMeetingId(),
      participants: participantIds,
      status: "scheduled",
    });

    await meeting.save({ session });

    await session.commitTransaction();
    transactionCommitted = true;

    await runStreamSyncSafely("meeting creation", async () => {
      await syncMeetingCall(
        meeting,
        participantIds.map((id) => id.toString()),
        user
      );
    });

    const joinUrl = getMeetingJoinUrl(workspaceId, meeting.id);
    broadcastWorkspaceEvent(workspaceId.toString(), "meeting.created", {
      meetingId: meeting.id,
      workspaceId: workspaceId.toString(),
      title: meeting.title,
      joinUrl,
      status: meeting.status,
      createdAt: meeting.createdAt,
    });

    return mapMeetingResponse(meeting);
  } catch (error) {
    if (!transactionCommitted) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getWorkspaceMeetings = async (workspaceId: string, user: any) => {
  await assertWorkspaceAccess(workspaceId, user);
  const meetings = await MeetingModel.find({
    workspaceId,
    participants: user._id,
  }).sort({
    scheduledAt: -1,
  });
  return meetings.map((meeting) => mapMeetingResponse(meeting));
};

export const getMeetingById = async (meetingId: string, user: any) => {
  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) {
    throw new NotFoundException("Meeting not found");
  }

  await assertMeetingParticipant(meeting, user);
  return mapMeetingResponse(meeting);
};

export const startMeeting = async (meetingId: string, user: any) => {
  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) {
    throw new NotFoundException("Meeting not found");
  }

  const member = await MemberModel.findOne({
    userId: user._id,
    workspaceId: meeting.workspaceId,
  }).populate("role");
  if (!member) {
    throw new UnauthorizedException("User is not a workspace member");
  }

  const roleName = (member.role as any)?.name;
  if (roleName !== Roles.OWNER && roleName !== Roles.ADMIN) {
    throw new UnauthorizedException("Only OWNER or ADMIN can start meetings");
  }

  meeting.status = "live";
  meeting.startedAt = meeting.startedAt || new Date();
  await meeting.save();

  await runStreamSyncSafely("meeting start", async () => {
    await syncMeetingCall(
      meeting,
      (meeting.participants || []).map((id: mongoose.Types.ObjectId) =>
        id.toString()
      ),
      user
    );
  });

  const joinUrl = getMeetingJoinUrl(meeting.workspaceId.toString(), meeting.id);
  broadcastWorkspaceEvent(meeting.workspaceId.toString(), "meeting.live", {
    meetingId: meeting.id,
    workspaceId: meeting.workspaceId.toString(),
    joinUrl,
    status: meeting.status,
    startedAt: meeting.startedAt,
  });

  return mapMeetingResponse(meeting);
};

export const endMeeting = async (meetingId: string, user: any) => {
  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) {
    throw new NotFoundException("Meeting not found");
  }

  const member = await MemberModel.findOne({
    userId: user._id,
    workspaceId: meeting.workspaceId,
  }).populate("role");
  if (!member) {
    throw new UnauthorizedException("User is not a workspace member");
  }

  const roleName = (member.role as any)?.name;
  if (roleName !== Roles.OWNER && roleName !== Roles.ADMIN) {
    throw new UnauthorizedException("Only OWNER or ADMIN can end meetings");
  }

  meeting.status = "ended";
  meeting.endedAt = meeting.endedAt || new Date();
  await meeting.save();

  if (config.STREAM_API_KEY && config.STREAM_API_SECRET) {
    try {
      const call = getStreamVideoClient().video.call(
        getStreamCallType(),
        meeting.roomId
      );
      await call.end();
    } catch (error) {
      console.error("Failed to end Stream call", error);
    }
  }

  const joinUrl = getMeetingJoinUrl(meeting.workspaceId.toString(), meeting.id);
  broadcastWorkspaceEvent(meeting.workspaceId.toString(), "meeting.ended", {
    meetingId: meeting.id,
    workspaceId: meeting.workspaceId.toString(),
    joinUrl,
    status: meeting.status,
    endedAt: meeting.endedAt,
  });

  return mapMeetingResponse(meeting);
};

export const deleteMeeting = async (meetingId: string, user: any) => {
  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) {
    throw new NotFoundException("Meeting not found");
  }

  const member = await MemberModel.findOne({
    userId: user._id,
    workspaceId: meeting.workspaceId,
  }).populate("role");
  if (!member) {
    throw new UnauthorizedException("User is not a workspace member");
  }

  const roleName = (member.role as any)?.name;
  if (roleName !== Roles.OWNER && roleName !== Roles.ADMIN) {
    throw new UnauthorizedException("Only OWNER or ADMIN can delete meetings");
  }

  await meeting.deleteOne();

  broadcastWorkspaceEvent(meeting.workspaceId.toString(), "meeting.deleted", {
    meetingId,
    workspaceId: meeting.workspaceId.toString(),
  });

  return { deleted: true };
};

export const getMeetingStreamCredentials = async (meetingId: string, user: any) => {
  const meeting = await MeetingModel.findById(meetingId);
  if (!meeting) {
    throw new NotFoundException("Meeting not found");
  }

  await assertMeetingParticipant(meeting, user);

  const client = getStreamVideoClient();
  const userId = user._id.toString();

  await client.upsertUsers([buildStreamUser(user)]);

  return {
    apiKey: config.STREAM_API_KEY,
    token: generateStreamUserToken(userId),
    user: buildStreamUser(user),
    callType: getStreamCallType(),
    callId: meeting.roomId,
  };
};

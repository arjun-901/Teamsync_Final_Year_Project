import ProjectModel from "../models/project.model";
import ProjectChatModel from "../models/project-chat.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { uploadFileToCloudinary } from "./cloudinary.service";
import { isUserProjectMemberService } from "./project-member.service";

const ensureProjectBelongsToWorkspace = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  return project;
};

export const createProjectChatMessageService = async ({
  workspaceId,
  projectId,
  userId,
  message,
  files = [],
}: {
  workspaceId: string;
  projectId: string;
  userId: string;
  message?: string;
  files?: Express.Multer.File[];
}) => {
  await ensureProjectBelongsToWorkspace(workspaceId, projectId);

  const canAccessProject = await isUserProjectMemberService(
    workspaceId,
    projectId,
    userId
  );

  if (!canAccessProject) {
    throw new BadRequestException(
      "Only selected project members can chat in this project"
    );
  }

  const trimmedMessage = message?.trim() || "";

  if (!trimmedMessage && files.length === 0) {
    throw new BadRequestException("Please add a message or upload a file");
  }

  const attachments = await Promise.all(
    files.map((file) =>
      uploadFileToCloudinary({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        workspaceId,
        projectId,
      })
    )
  );

  const chatMessage = await ProjectChatModel.create({
    workspace: workspaceId,
    project: projectId,
    sender: userId,
    message: trimmedMessage || null,
    attachments,
  });

  const populatedMessage = await ProjectChatModel.findById(chatMessage._id)
    .populate("sender", "_id name email profilePicture")
    .lean();

  return { chatMessage: populatedMessage };
};

export const getProjectChatMessagesService = async ({
  workspaceId,
  projectId,
  userId,
  pageSize,
  pageNumber,
  attachmentsOnly = false,
}: {
  workspaceId: string;
  projectId: string;
  userId: string;
  pageSize: number;
  pageNumber: number;
  attachmentsOnly?: boolean;
}) => {
  await ensureProjectBelongsToWorkspace(workspaceId, projectId);

  const canAccessProject = await isUserProjectMemberService(
    workspaceId,
    projectId,
    userId
  );

  if (!canAccessProject) {
    throw new BadRequestException(
      "Only selected project members can view this project chat"
    );
  }

  const query = {
    workspace: workspaceId,
    project: projectId,
    ...(attachmentsOnly ? { "attachments.0": { $exists: true } } : {}),
  };

  const totalCount = await ProjectChatModel.countDocuments(query);
  const skip = (pageNumber - 1) * pageSize;

  const messages = await ProjectChatModel.find(query)
    .populate("sender", "_id name email profilePicture")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    messages: messages.reverse(),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    pageNumber,
    pageSize,
    skip,
  };
};

export const deleteProjectChatMessageService = async ({
  workspaceId,
  projectId,
  messageId,
  userId,
}: {
  workspaceId: string;
  projectId: string;
  messageId: string;
  userId: string;
}) => {
  await ensureProjectBelongsToWorkspace(workspaceId, projectId);

  const message = await ProjectChatModel.findOne({
    _id: messageId,
    workspace: workspaceId,
    project: projectId,
  });

  if (!message) {
    throw new NotFoundException("Chat message not found");
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new BadRequestException("Only the sender can delete this message");
  }

  message.isDeletedBySender = true;
  message.deletedAt = new Date();
  message.message = "This message was deleted by the sender.";
  message.attachments = [];

  await message.save();

  return { message };
};

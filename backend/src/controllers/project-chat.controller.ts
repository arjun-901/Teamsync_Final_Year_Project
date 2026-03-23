import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getMemberRoleInWorkspace } from "../services/member.service";
import {
  createProjectChatMessageService,
  deleteProjectChatMessageService,
  getProjectChatMessagesService,
} from "../services/project-chat.service";
import { Permissions } from "../enums/role.enum";
import { roleGuard } from "../utils/roleGuard";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import {
  projectChatMessageSchema,
  projectChatPaginationSchema,
} from "../validation/project-chat.validation";
import { BadRequestException } from "../utils/appError";

export const createProjectChatMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const body = projectChatMessageSchema.parse(req.body);
    const files = (req.files as Express.Multer.File[]) || [];

    if (!body.message?.trim() && files.length === 0) {
      throw new BadRequestException("Please add a message or upload a file");
    }

    const { chatMessage } = await createProjectChatMessageService({
      workspaceId,
      projectId,
      userId,
      message: body.message,
      files,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Chat message sent successfully",
      chatMessage,
    });
  }
);

export const getProjectChatMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const query = projectChatPaginationSchema.parse(req.query);

    const data = await getProjectChatMessagesService({
      workspaceId,
      projectId,
      userId,
      pageSize: query.pageSize || 50,
      pageNumber: query.pageNumber || 1,
      attachmentsOnly: req.query.attachmentsOnly === "true",
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Project chat messages fetched successfully",
      ...data,
    });
  }
);

export const deleteProjectChatMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const messageId = projectIdSchema.parse(req.params.messageId);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    await deleteProjectChatMessageService({
      workspaceId,
      projectId,
      messageId,
      userId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Chat message deleted successfully",
    });
  }
);

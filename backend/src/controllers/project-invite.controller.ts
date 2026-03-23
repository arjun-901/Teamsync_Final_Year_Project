import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getMemberRoleInWorkspace } from "../services/member.service";
import {
  createProjectInviteService,
  getProjectInviteDetailsService,
  joinProjectByInviteService,
} from "../services/project-invite.service";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role.enum";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import { z } from "zod";

export const createProjectInviteController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const data = await createProjectInviteService({
      workspaceId,
      projectId,
      userId,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Project invite link created successfully",
      ...data,
    });
  }
);

export const getProjectInviteDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const token = z.string().trim().min(1).parse(req.params.token);
    const data = await getProjectInviteDetailsService(token);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project invite fetched successfully",
      ...data,
    });
  }
);

export const joinProjectInviteController = asyncHandler(
  async (req: Request, res: Response) => {
    const token = z.string().trim().min(1).parse(req.params.token);
    const userId = req.user?._id;

    const data = await joinProjectByInviteService({
      token,
      userId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Joined project successfully",
      ...data,
    });
  }
);

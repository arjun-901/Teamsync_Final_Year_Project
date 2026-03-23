import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { Permissions } from "../enums/role.enum";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { getMemberRoleInWorkspace } from "../services/member.service";
import {
  getProjectMembersService,
  updateProjectMembersService,
} from "../services/project-member.service";
import { roleGuard } from "../utils/roleGuard";
import { updateProjectMembersSchema } from "../validation/project-member.validation";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";

export const getProjectMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const data = await getProjectMembersService(workspaceId, projectId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project members fetched successfully",
      ...data,
    });
  }
);

export const updateProjectMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.id);
    const userId = req.user?._id;
    const { memberIds } = updateProjectMembersSchema.parse(req.body);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const data = await updateProjectMembersService({
      workspaceId,
      projectId,
      memberIds,
      actorUserId: userId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Project members updated successfully",
      ...data,
    });
  }
);

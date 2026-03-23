import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { z } from "zod";
import { HTTPSTATUS } from "../config/http.config";
import { joinWorkspaceByInviteService } from "../services/member.service";
import {
  getProjectInviteDetailsService,
  joinProjectByInviteService,
} from "../services/project-invite.service";

export const joinWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const inviteCode = z.string().parse(req.params.inviteCode);
    const userId = req.user?._id;

    const { workspaceId, role } = await joinWorkspaceByInviteService(
      userId,
      inviteCode
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Successfully joined the workspace",
      workspaceId,
      role,
    });
  }
);

export const getProjectInviteDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const token = z.string().trim().min(1).parse(req.params.token);

    const { invite } = await getProjectInviteDetailsService(token);

    return res.status(HTTPSTATUS.OK).json({
      message: "Project invite fetched successfully",
      invite,
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

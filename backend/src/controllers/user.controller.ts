import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  changeCurrentUserPasswordService,
  getCurrentUserService,
  updateCurrentUserProfileService,
} from "../services/user.service";
import {
  changeCurrentUserPasswordSchema,
  updateCurrentUserProfileSchema,
} from "../validation/user.validation";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);

export const updateCurrentUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = updateCurrentUserProfileSchema.parse(req.body);

    const { user } = await updateCurrentUserProfileService({
      userId,
      name: body.name,
      email: body.email,
      file: req.file,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Profile updated successfully.",
      user,
    });
  }
);

export const changeCurrentUserPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = changeCurrentUserPasswordSchema.parse(req.body);

    await changeCurrentUserPasswordService({
      userId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Password updated successfully.",
    });
  }
);

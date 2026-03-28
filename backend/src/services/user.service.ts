import UserModel from "../models/user.model";
import { BadRequestException, UnauthorizedException } from "../utils/appError";
import { uploadProfileImageToCloudinary } from "./cloudinary.service";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return {
    user,
  };
};

export const updateCurrentUserProfileService = async ({
  userId,
  name,
  email,
  file,
}: {
  userId: string;
  name: string;
  email: string;
  file?: Express.Multer.File;
}) => {
  const existingUser = await UserModel.findById(userId);

  if (!existingUser) {
    throw new BadRequestException("User not found");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== existingUser.email) {
    const emailInUse = await UserModel.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (emailInUse) {
      throw new BadRequestException("This email address is already in use.");
    }
  }

  existingUser.name = name.trim();
  existingUser.email = normalizedEmail;

  if (file) {
    const uploadedImage = await uploadProfileImageToCloudinary({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      userId,
    });

    existingUser.profilePicture = uploadedImage.url;
  }

  await existingUser.save();

  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  return { user };
};

export const changeCurrentUserPasswordService = async ({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword?: string;
  newPassword: string;
}) => {
  const user = await UserModel.findById(userId).select("+password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  if (user.password) {
    if (!currentPassword) {
      throw new BadRequestException("Current password is required.");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedException("Current password is incorrect.");
    }
  }

  user.password = newPassword;
  await user.save();

  return { user: user.omitPassword() };
};

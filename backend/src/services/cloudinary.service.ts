import cloudinary from "../config/cloudinary.config";

type UploadInput = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  workspaceId: string;
  projectId: string;
};

const getFileType = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation") ||
    mimeType.startsWith("text/")
  ) {
    return "document";
  }

  return "file";
};

export const uploadFileToCloudinary = async ({
  buffer,
  originalName,
  mimeType,
  size,
  workspaceId,
  projectId,
}: UploadInput) => {
  const encoded = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(encoded, {
    folder: `teamsync/project-chat/${workspaceId}/${projectId}`,
    resource_type: "auto",
    use_filename: true,
    unique_filename: true,
    filename_override: originalName,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName,
    mimeType,
    size,
    resourceType: result.resource_type,
    fileType: getFileType(mimeType),
  };
};

export const uploadProfileImageToCloudinary = async ({
  buffer,
  originalName,
  mimeType,
  size,
  userId,
}: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  userId: string;
}) => {
  const encoded = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(encoded, {
    folder: `teamsync/profile/${userId}`,
    resource_type: "image",
    use_filename: true,
    unique_filename: true,
    filename_override: originalName,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName,
    mimeType,
    size,
    resourceType: result.resource_type,
    fileType: "image",
  };
};

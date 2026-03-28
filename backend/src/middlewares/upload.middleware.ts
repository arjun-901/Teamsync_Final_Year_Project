import multer from "multer";
import { BadRequestException } from "../utils/appError";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

export const chatUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname) {
      cb(new BadRequestException("Invalid file"));
      return;
    }

    cb(null, true);
  },
});

export const profileUpload = multer({
  storage,
  limits: {
    fileSize: MAX_PROFILE_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new BadRequestException("Only image files are allowed."));
      return;
    }

    cb(null, true);
  },
});

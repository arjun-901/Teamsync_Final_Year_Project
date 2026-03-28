import { Router } from "express";
import {
  changeCurrentUserPasswordController,
  getCurrentUserController,
  updateCurrentUserProfileController,
} from "../controllers/user.controller";
import { profileUpload } from "../middlewares/upload.middleware";

const userRoutes = Router();

userRoutes.get("/current", getCurrentUserController);
userRoutes.put(
  "/profile",
  profileUpload.single("profilePicture"),
  updateCurrentUserProfileController
);
userRoutes.put("/password", changeCurrentUserPasswordController);

export default userRoutes;

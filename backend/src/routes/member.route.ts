import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import {
  getProjectInviteDetailsController,
  joinProjectInviteController,
  joinWorkspaceController,
} from "../controllers/member.controller";

const memberRoutes = Router();

memberRoutes.get("/project-invite/:token", getProjectInviteDetailsController);
memberRoutes.post("/workspace/:inviteCode/join", isAuthenticated, joinWorkspaceController);
memberRoutes.post(
  "/project-invite/:token/join",
  isAuthenticated,
  joinProjectInviteController
);

export default memberRoutes;

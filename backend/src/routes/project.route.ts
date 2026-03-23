import { Router } from "express";
import {
  createProjectController,
  createProjectChatMessageController,
  deleteProjectController,
  deleteProjectChatMessageController,
  getAllProjectsInWorkspaceController,
  getProjectAnalyticsController,
  getProjectByIdAndWorkspaceIdController,
  getProjectChatMessagesController,
  createProjectInviteController,
  getProjectMembersController,
  updateProjectMembersController,
  updateProjectController,
} from "../controllers/project.controller";
import { chatUpload } from "../middlewares/upload.middleware";

const projectRoutes = Router();

projectRoutes.post("/workspace/:workspaceId/create", createProjectController);

projectRoutes.put(
  "/:id/workspace/:workspaceId/update",
  updateProjectController
);

projectRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  deleteProjectController
);

projectRoutes.get(
  "/workspace/:workspaceId/all",
  getAllProjectsInWorkspaceController
);

projectRoutes.get(
  "/:id/workspace/:workspaceId/analytics",
  getProjectAnalyticsController
);

projectRoutes.get(
  "/:id/workspace/:workspaceId",
  getProjectByIdAndWorkspaceIdController
);

projectRoutes.get(
  "/:id/workspace/:workspaceId/chat/messages",
  getProjectChatMessagesController
);

projectRoutes.post(
  "/:id/workspace/:workspaceId/chat/messages",
  chatUpload.array("files", 10),
  createProjectChatMessageController
);

projectRoutes.delete(
  "/:id/workspace/:workspaceId/chat/messages/:messageId",
  deleteProjectChatMessageController
);

projectRoutes.get(
  "/:id/workspace/:workspaceId/members",
  getProjectMembersController
);

projectRoutes.put(
  "/:id/workspace/:workspaceId/members",
  updateProjectMembersController
);

projectRoutes.post(
  "/:id/workspace/:workspaceId/invite-link",
  createProjectInviteController
);

export default projectRoutes;

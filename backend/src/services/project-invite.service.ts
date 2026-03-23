import MemberModel from "../models/member.model";
import ProjectInviteModel from "../models/project-invite.model";
import ProjectModel from "../models/project.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { Roles } from "../enums/role.enum";
import { addProjectMemberIfMissing } from "./project-member.service";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { config } from "../config/app.config";

const buildProjectInviteUrl = (token: string) => {
  return `${config.FRONTEND_APP_URL}${config.FRONTEND_PROJECT_INVITE_PATH.replace(
    ":token",
    token
  )}`;
};

export const createProjectInviteService = async ({
  workspaceId,
  projectId,
  userId,
}: {
  workspaceId: string;
  projectId: string;
  userId: string;
}) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException("Project not found");
  }

  const invite = await ProjectInviteModel.create({
    workspace: workspaceId,
    project: projectId,
    invitedBy: userId,
  });

  return {
    invite,
    inviteUrl: buildProjectInviteUrl(invite.token),
  };
};

export const getProjectInviteDetailsService = async (token: string) => {
  const invite = await ProjectInviteModel.findOne({ token })
    .populate("workspace", "name description inviteCode")
    .populate("project", "name emoji description")
    .populate("invitedBy", "name email profilePicture")
    .lean();

  if (!invite) {
    throw new NotFoundException("Invite link is invalid or expired");
  }

  return { invite };
};

export const joinProjectByInviteService = async ({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) => {
  const invite = await ProjectInviteModel.findOne({ token });

  if (!invite) {
    throw new NotFoundException("Invite link is invalid or expired");
  }

  const [workspace, project, user] = await Promise.all([
    WorkspaceModel.findById(invite.workspace),
    ProjectModel.findById(invite.project),
    UserModel.findById(userId),
  ]);

  if (!workspace || !project || !user) {
    throw new NotFoundException("Invite resource not found");
  }

  let membership = await MemberModel.findOne({
    userId,
    workspaceId: workspace._id,
  });

  if (!membership) {
    const memberRole = await RoleModel.findOne({ name: Roles.MEMBER });

    if (!memberRole) {
      throw new NotFoundException("Member role not found");
    }

    membership = await MemberModel.create({
      userId,
      workspaceId: workspace._id,
      role: memberRole._id,
      joinedAt: new Date(),
    });
  }

  await addProjectMemberIfMissing({
    workspaceId: String(workspace._id),
    projectId: String(project._id),
    userId,
    addedBy: invite.invitedBy.toString(),
  });

  user.currentWorkspace = workspace._id as any;
  await user.save();

  return {
    workspaceId: workspace._id,
    projectId: project._id,
    membership,
  };
};

import MemberModel from "../models/member.model";
import ProjectMemberModel from "../models/project-member.model";
import ProjectModel from "../models/project.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

export const ensureProjectBelongsToWorkspace = async (
  workspaceId: string,
  projectId: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  return project;
};

export const addProjectMemberIfMissing = async ({
  workspaceId,
  projectId,
  userId,
  addedBy,
}: {
  workspaceId: string;
  projectId: string;
  userId: string;
  addedBy: string;
}) => {
  await ProjectMemberModel.updateOne(
    {
      workspace: workspaceId,
      project: projectId,
      userId,
    },
    {
      $setOnInsert: {
        addedBy,
      },
    },
    {
      upsert: true,
    }
  );
};

export const isUserProjectMemberService = async (
  workspaceId: string,
  projectId: string,
  userId: string
) => {
  const membership = await ProjectMemberModel.exists({
    workspace: workspaceId,
    project: projectId,
    userId,
  });

  return Boolean(membership);
};

export const getProjectMembersService = async (
  workspaceId: string,
  projectId: string
) => {
  await ensureProjectBelongsToWorkspace(workspaceId, projectId);

  const [workspaceMembers, projectMembers] = await Promise.all([
    MemberModel.find({ workspaceId })
      .populate("userId", "name email profilePicture")
      .populate("role", "name")
      .lean(),
    ProjectMemberModel.find({
      workspace: workspaceId,
      project: projectId,
    })
      .populate("userId", "name email profilePicture")
      .lean(),
  ]);

  const selectedUserIds = new Set(
    projectMembers.map((member) => member.userId?._id?.toString())
  );

  const members = workspaceMembers.map((member) => ({
    ...member,
    isProjectMember: selectedUserIds.has(member.userId?._id?.toString()),
  }));

  return { members, projectMembers };
};

export const updateProjectMembersService = async ({
  workspaceId,
  projectId,
  memberIds,
  actorUserId,
}: {
  workspaceId: string;
  projectId: string;
  memberIds: string[];
  actorUserId: string;
}) => {
  const project = await ensureProjectBelongsToWorkspace(workspaceId, projectId);

  const uniqueMemberIds = Array.from(
    new Set([...memberIds, project.createdBy.toString()])
  );

  const workspaceMembers = await MemberModel.find({
    workspaceId,
    userId: {
      $in: uniqueMemberIds,
    },
  }).select("userId");

  if (workspaceMembers.length !== uniqueMemberIds.length) {
    throw new BadRequestException(
      "One or more selected users are not members of this workspace"
    );
  }

  await ProjectMemberModel.deleteMany({
    workspace: workspaceId,
    project: projectId,
  });

  if (uniqueMemberIds.length > 0) {
    await ProjectMemberModel.insertMany(
      uniqueMemberIds.map((userId) => ({
        workspace: workspaceId,
        project: projectId,
        userId,
        addedBy: actorUserId,
      }))
    );
  }

  const { members, projectMembers } = await getProjectMembersService(
    workspaceId,
    projectId
  );

  return { members, projectMembers };
};

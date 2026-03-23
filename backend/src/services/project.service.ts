import mongoose from "mongoose";
import ProjectChatModel from "../models/project-chat.model";
import ProjectMemberModel from "../models/project-member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { NotFoundException } from "../utils/appError";
import { TaskStatusEnum } from "../enums/task.enum";
import { addProjectMemberIfMissing } from "./project-member.service";
import { Roles } from "../enums/role.enum";

export const createProjectService = async (
  userId: string,
  workspaceId: string,
  body: {
    emoji?: string;
    name: string;
    description?: string;
  }
) => {
  const project = new ProjectModel({
    ...(body.emoji && { emoji: body.emoji }),
    name: body.name,
    description: body.description,
    workspace: workspaceId,
    createdBy: userId,
  });

  await project.save();

  await addProjectMemberIfMissing({
    workspaceId,
    projectId: String(project._id),
    userId,
    addedBy: userId,
  });

  return { project };
};

export const getProjectsInWorkspaceService = async (
  workspaceId: string,
  userId: string,
  role: string,
  pageSize: number,
  pageNumber: number
) => {
  let allowedProjectIds: mongoose.Types.ObjectId[] | null = null;

  if (role === Roles.MEMBER) {
    const memberships = await ProjectMemberModel.find({
      workspace: workspaceId,
      userId,
    }).select("project");

    allowedProjectIds = memberships.map((item) => item.project);
  }

  const projectQuery = {
    workspace: workspaceId,
    ...(allowedProjectIds ? { _id: { $in: allowedProjectIds } } : {}),
  };

  const totalCount = await ProjectModel.countDocuments(projectQuery);

  const skip = (pageNumber - 1) * pageSize;

  const projects = await ProjectModel.find(projectQuery)
    .skip(skip)
    .limit(pageSize)
    .populate("createdBy", "_id name profilePicture -password")
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
};

export const getProjectByIdAndWorkspaceIdService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  role: string
) => {
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  }).select("_id emoji name description");

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  if (role === Roles.MEMBER) {
    const isProjectMember = await ProjectMemberModel.exists({
      workspace: workspaceId,
      project: projectId,
      userId,
    });

    if (!isProjectMember) {
      throw new NotFoundException("Project not found");
    }
  }

  return { project };
};

export const getProjectAnalyticsService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  role: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  if (role === Roles.MEMBER) {
    const isProjectMember = await ProjectMemberModel.exists({
      workspace: workspaceId,
      project: projectId,
      userId,
    });

    if (!isProjectMember) {
      throw new NotFoundException("Project not found");
    }
  }

  const currentDate = new Date();

  //USING Mongoose aggregate
  const taskAnalytics = await TaskModel.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: currentDate },
              status: {
                $ne: TaskStatusEnum.DONE,
              },
            },
          },
          {
            $count: "count",
          },
        ],
        completedTasks: [
          {
            $match: {
              status: TaskStatusEnum.DONE,
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  const _analytics = taskAnalytics[0];

  const analytics = {
    totalTasks: _analytics.totalTasks[0]?.count || 0,
    overdueTasks: _analytics.overdueTasks[0]?.count || 0,
    completedTasks: _analytics.completedTasks[0]?.count || 0,
  };

  return {
    analytics,
  };
};

export const updateProjectService = async (
  workspaceId: string,
  projectId: string,
  body: {
    emoji?: string;
    name: string;
    description?: string;
  }
) => {
  const { name, emoji, description } = body;

  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });

  if (!project) {
    throw new NotFoundException(
      "Project not found or does not belong to the specified workspace"
    );
  }

  if (emoji) project.emoji = emoji;
  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();

  return { project };
};

export const deleteProjectService = async (
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

  await project.deleteOne();

  await TaskModel.deleteMany({
    project: project._id,
  });
  await ProjectMemberModel.deleteMany({
    project: project._id,
  });
  await ProjectChatModel.deleteMany({
    project: project._id,
  });

  return project;
};

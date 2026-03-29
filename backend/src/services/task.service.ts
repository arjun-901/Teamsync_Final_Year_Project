import mongoose from "mongoose";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import ProjectMemberModel from "../models/project-member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { isUserProjectMemberService } from "./project-member.service";
import { Roles } from "../enums/role.enum";

const normalizeAssignedUserIds = (assignedTo?: string[]) => {
  if (!assignedTo || assignedTo.length === 0) return [];
  return Array.from(new Set(assignedTo.filter(Boolean)));
};

const includesAssignedUser = (
  assignedTo: Array<mongoose.Types.ObjectId | string> | undefined,
  userId: string
) => {
  if (!assignedTo || assignedTo.length === 0) return false;
  return assignedTo.some((assignee) => assignee.toString() === userId.toString());
};

const assertAssignedUsersAreProjectMembers = async ({
  workspaceId,
  projectId,
  assignedTo,
}: {
  workspaceId: string;
  projectId: string;
  assignedTo: string[];
}) => {
  const results = await Promise.all(
    assignedTo.map((assigneeId) =>
      isUserProjectMemberService(workspaceId, projectId, assigneeId)
    )
  );

  const hasInvalidAssignee = results.some((isMember) => !isMember);

  if (hasInvalidAssignee) {
    throw new BadRequestException(
      "One or more assigned users are not members of this project."
    );
  }
};

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  role: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string[];
    dueDate?: string;
  }
) => {
  const { title, description, priority, status, dueDate } = body;
  const assignedTo = normalizeAssignedUserIds(body.assignedTo);

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }
  if (role === Roles.MEMBER) {
    const canAccessProject = await isUserProjectMemberService(
      workspaceId,
      projectId,
      userId
    );

    if (!canAccessProject) {
      throw new NotFoundException("Project not found");
    }
  }
  if (assignedTo.length > 0) {
    await assertAssignedUsersAreProjectMembers({
      workspaceId,
      projectId,
      assignedTo,
    });
  }
  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  role: string,
  body: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: string[];
    dueDate?: string;
  }
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  if (role === Roles.MEMBER) {
    const canAccessProject = await isUserProjectMemberService(
      workspaceId,
      projectId,
      userId
    );

    if (!canAccessProject) {
      throw new NotFoundException("Project not found");
    }
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  if (role === Roles.MEMBER) {
    if (!includesAssignedUser(task.assignedTo as mongoose.Types.ObjectId[], userId)) {
      throw new NotFoundException("Task not found.");
    }

    const allowedKeys = ["status"];
    const providedKeys = Object.keys(body).filter(
      (key) => body[key as keyof typeof body] !== undefined
    );

    const isOnlyStatusUpdate =
      providedKeys.length > 0 &&
      providedKeys.every((key) => allowedKeys.includes(key));

    if (!isOnlyStatusUpdate) {
      throw new BadRequestException(
        "Members can only update the status of their assigned tasks."
      );
    }
  }

  const updatePayload = {
    ...body,
    ...(body.assignedTo
      ? { assignedTo: normalizeAssignedUserIds(body.assignedTo) }
      : {}),
  };

  if (updatePayload.assignedTo && updatePayload.assignedTo.length > 0) {
    await assertAssignedUsersAreProjectMembers({
      workspaceId,
      projectId,
      assignedTo: updatePayload.assignedTo,
    });
  }

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    updatePayload,
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  userId: string,
  role: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (role === Roles.MEMBER) {
    const memberships = await ProjectMemberModel.find({
      workspace: workspaceId,
      userId,
    }).select("project");

    query.project = {
      $in: memberships.map((item) => item.project),
    };
    query.assignedTo = userId;
  }

  if (filters.projectId) {
    if (query.project?.$in) {
      query.project = {
        $in: query.project.$in.filter(
          (projectId: mongoose.Types.ObjectId) =>
            projectId.toString() === filters.projectId
        ),
      };
    } else {
      query.project = filters.projectId;
    }
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (
    role !== Roles.MEMBER &&
    filters.assignedTo &&
    filters.assignedTo?.length > 0
  ) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
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
    const canAccessProject = await isUserProjectMemberService(
      workspaceId,
      projectId,
      userId
    );

    if (!canAccessProject) {
      throw new NotFoundException("Task not found.");
    }
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  }).populate("assignedTo", "_id name profilePicture -password");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  if (
    role === Roles.MEMBER &&
    !includesAssignedUser(task.assignedTo as mongoose.Types.ObjectId[], userId)
  ) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  return;
};

import mongoose, { Document, Schema } from "mongoose";

export interface ProjectChatAttachment {
  url: string;
  publicId: string;
  originalName: string;
  mimeType: string;
  size: number;
  resourceType: string;
  fileType: string;
}

export interface ProjectChatDocument extends Document {
  workspace: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  message: string | null;
  attachments: ProjectChatAttachment[];
  isDeletedBySender: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<ProjectChatAttachment>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    resourceType: { type: String, required: true },
    fileType: { type: String, required: true },
  },
  {
    _id: false,
  }
);

const projectChatSchema = new Schema<ProjectChatDocument>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: null,
      trim: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    isDeletedBySender: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

projectChatSchema.index({ project: 1, createdAt: -1 });
projectChatSchema.index({ workspace: 1, project: 1 });

const ProjectChatModel = mongoose.model<ProjectChatDocument>(
  "ProjectChat",
  projectChatSchema
);

export default ProjectChatModel;

import mongoose, { Document, Schema } from "mongoose";
import { generateInviteCode } from "../utils/uuid";

export interface ProjectInviteDocument extends Document {
  token: string;
  workspace: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectInviteSchema = new Schema<ProjectInviteDocument>(
  {
    token: {
      type: String,
      unique: true,
      required: true,
      default: generateInviteCode,
    },
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
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

projectInviteSchema.index({ workspace: 1, project: 1, invitedBy: 1 });

const ProjectInviteModel = mongoose.model<ProjectInviteDocument>(
  "ProjectInvite",
  projectInviteSchema
);

export default ProjectInviteModel;

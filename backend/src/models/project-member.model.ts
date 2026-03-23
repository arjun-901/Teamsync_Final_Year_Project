import mongoose, { Document, Schema } from "mongoose";

export interface ProjectMemberDocument extends Document {
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<ProjectMemberDocument>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

projectMemberSchema.index({ project: 1, userId: 1 }, { unique: true });
projectMemberSchema.index({ workspace: 1, project: 1 });

const ProjectMemberModel = mongoose.model<ProjectMemberDocument>(
  "ProjectMember",
  projectMemberSchema
);

export default ProjectMemberModel;

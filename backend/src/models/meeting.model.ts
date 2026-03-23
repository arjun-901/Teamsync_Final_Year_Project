import mongoose, { Document, Schema } from "mongoose";

export type MeetingStatus = "scheduled" | "live" | "ended";

export interface MeetingDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId | null;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number;
  createdBy: mongoose.Types.ObjectId;
  roomId: string;
  participants: mongoose.Types.ObjectId[];
  status: MeetingStatus;
  startedAt?: Date | null;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<MeetingDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
      default: null,
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["scheduled", "live", "ended"],
      default: "scheduled",
    },
    startedAt: { type: Date, required: false, default: null },
    endedAt: { type: Date, required: false, default: null },
  },
  { timestamps: true }
);

const MeetingModel = mongoose.model<MeetingDocument>("Meeting", meetingSchema);
export default MeetingModel;

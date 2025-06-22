import { Schema, model, Document, Types } from "mongoose";

export interface ITrainingSession extends Document {
  agentId: Types.ObjectId;
  description?: string;
  source?: string;
  status: "pending" | "training" | "completed" | "failed";
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSessionSchema = new Schema<ITrainingSession>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    description: { type: String },
    source: { type: String },
    status: {
      type: String,
      enum: ["pending", "training", "completed", "failed"],
      required: true,
      default: "pending",
    },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const TrainingSession = model<ITrainingSession>(
  "TrainingSession",
  TrainingSessionSchema
);

export default TrainingSession;

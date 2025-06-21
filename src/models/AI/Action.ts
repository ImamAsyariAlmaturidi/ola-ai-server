import { Schema, model, Document, Types } from "mongoose";

export type ActionType =
  | "http_request"
  | "email"
  | "db_query"
  | "webhook"
  | "internal_function";

export interface IAction extends Document {
  agentId: Types.ObjectId;
  trigger: string;
  actionType: ActionType | string;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IAction>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    trigger: { type: String, required: true },
    actionType: { type: String, required: true },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Action = model<IAction>("Action", ActionSchema);

export default Action;

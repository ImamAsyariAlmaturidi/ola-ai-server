import { Schema, model, Document, Types } from "mongoose";

export type IntegrationType =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "tokopedia"
  | "gcal"
  | "slack"
  | "custom";

export interface IIntegration extends Document {
  agentId: Types.ObjectId;
  type: IntegrationType | string;
  status: "active" | "inactive";
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      required: true,
      default: "inactive",
    },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Integration = model<IIntegration>("Integration", IntegrationSchema);

export default Integration;

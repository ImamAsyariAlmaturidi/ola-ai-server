import { Schema, model, Document, Types } from "mongoose";

export interface IThirdPartyApp extends Document {
  agentId: Types.ObjectId;
  name: string;
  description?: string;
  registered: boolean;
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ThirdPartyAppSchema = new Schema<IThirdPartyApp>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    name: { type: String, required: true },
    description: { type: String },
    registered: { type: Boolean, default: false },
    apiKey: { type: String },
  },
  { timestamps: true }
);

const ThirdPartyApp = model<IThirdPartyApp>(
  "ThirdPartyApp",
  ThirdPartyAppSchema
);

export default ThirdPartyApp;

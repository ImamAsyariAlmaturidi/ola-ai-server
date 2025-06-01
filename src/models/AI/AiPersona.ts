import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAiPersona extends Document {
  userId: string;
  channel: string;
  interactionType: string;
  style: "formal" | "santai" | "profesional";
  useEmoji: boolean;
  promptTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

const AiPersonaSchema: Schema<IAiPersona> = new Schema({
  userId: { type: String, required: true },
  channel: { type: String, required: true },
  interactionType: { type: String, required: true },
  style: {
    type: String,
    enum: ["formal", "santai", "profesional"],
    default: "santai",
  },
  useEmoji: { type: Boolean, default: true },
  promptTemplate: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

AiPersonaSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const AiPersona: Model<IAiPersona> = mongoose.model<IAiPersona>(
  "AiPersona",
  AiPersonaSchema
);

export default AiPersona;

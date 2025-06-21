import { Schema, model, Document, Types } from "mongoose";

type KnowledgeSourceType = "text" | "website" | "file" | "qna" | "product";

export interface IKnowledgeSourceStats {
  characters?: number;
  links?: number;
  files?: number;
  qnaCount?: number;
}

export interface IKnowledgeSource extends Document {
  agentId: Types.ObjectId;
  type: KnowledgeSourceType;
  content?: string;
  label?: string;
  stats?: IKnowledgeSourceStats;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeSourceSchema = new Schema<IKnowledgeSource>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    type: {
      type: String,
      enum: ["text", "website", "file", "qna", "product"],
      required: true,
    },
    content: { type: String },
    label: { type: String },
    stats: {
      characters: { type: Number },
      links: { type: Number },
      files: { type: Number },
      qnaCount: { type: Number },
    },
  },
  { timestamps: true }
);

const KnowledgeSource = model<IKnowledgeSource>(
  "KnowledgeSource",
  KnowledgeSourceSchema
);

export default KnowledgeSource;

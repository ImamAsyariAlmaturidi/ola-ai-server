import { Schema, model, Document, Types } from "mongoose";

export interface IEmbeddingMetadata {
  source?: string;
  label?: string;
}

export interface IEmbedding extends Document {
  agentId: Types.ObjectId;
  content: string;
  vector: number[];
  metadata?: IEmbeddingMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const EmbeddingSchema = new Schema<IEmbedding>(
  {
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    content: { type: String, required: true },
    vector: { type: [Number], required: true },
    metadata: {
      source: { type: String },
      label: { type: String },
    },
  },
  { timestamps: true }
);

const Embedding = model<IEmbedding>("Embedding", EmbeddingSchema);

export default Embedding;

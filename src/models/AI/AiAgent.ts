import mongoose from "mongoose";

const AiAgentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: String,
    greeting: String,
    channels: [String],
    languageStyle: { type: String, default: "casual" },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: { type: Boolean, default: true },
    knowledgeBaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiKnowledgeBase",
    },
    abilities: [{ type: mongoose.Schema.Types.ObjectId, ref: "AiAbility" }],
    integrations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AiIntegration" },
    ],
    graph: Object,
  },
  { timestamps: true }
);

export default mongoose.model("AiAgent", AiAgentSchema);

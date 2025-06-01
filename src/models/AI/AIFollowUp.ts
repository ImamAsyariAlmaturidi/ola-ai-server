import mongoose from "mongoose";

const AiFollowUpSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiAgent",
      required: true,
    },
    message: { type: String, required: true },
    delay: { type: Number, default: 300000 },
  },
  { timestamps: true }
);

export default mongoose.model("AiFollowUp", AiFollowUpSchema);

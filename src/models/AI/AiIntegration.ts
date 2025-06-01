import mongoose from "mongoose";

const AiIntegrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    config: Object,
  },
  { timestamps: true }
);

export default mongoose.model("AiIntegration", AiIntegrationSchema);

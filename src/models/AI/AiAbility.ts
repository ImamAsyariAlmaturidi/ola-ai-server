import mongoose from "mongoose";

const AiAbilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    config: Object,
  },
  { timestamps: true }
);

export default mongoose.model("AiAbility", AiAbilitySchema);

// models/ConnectedPlatform.ts
import mongoose from "mongoose";

const connectedPlatformSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // asumsi kamu punya model User
      required: true,
    },
    platform: {
      type: String,
      enum: ["instagram", "facebook", "tiktok", "whatsapp"], // scalable
      required: true,
    },
    accountId: {
      type: String, // Instagram user id
      required: true,
    },
    username: String,
    name: String,
    profilePictureUrl: String,

    accessToken: {
      type: String,
      required: true,
    },
    accessTokenExpiresAt: Date, // bisa digunakan untuk refresh token

    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastSyncedAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ConnectedPlatform ||
  mongoose.model("ConnectedPlatform", connectedPlatformSchema);

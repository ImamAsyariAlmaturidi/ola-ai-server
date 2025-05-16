import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://imamasyari800:Imambae123@ola-ai.4mznjax.mongodb.net/?retryWrites=true&w=majority&appName=OLA-AI";

export const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // stop process kalau gagal connect
  }
};

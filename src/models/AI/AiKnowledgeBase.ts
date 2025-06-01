import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAiKnowledgeBase extends Document {
  userId: string; // ID pengguna yang memiliki knowledge base ini
  channel: "whatsapp" | "instagram" | "facebook" | "telegram" | "other"; // Channel komunikasi
  title: string; // Judul dari knowledge base (misalnya, nama topik atau konteks)
  description: string; // Deskripsi singkat tentang knowledge base
  content: string; // Isi dari knowledge base yang akan diproses oleh AI
  fileUrl?: string; // URL untuk file yang diunggah (misalnya, file PDF, CSV)
  fileType?: "pdf" | "csv" | "json" | "txt"; // Jenis file (PDF, CSV, JSON, TXT, dll)
  contentType: "text" | "file"; // Menentukan apakah content berupa teks atau file
  tags: string[]; // Tag untuk kategorisasi
  aiHistory: [
    {
      interactionDate: Date;
      changes: string; // Deskripsi perubahan atau interaksi dengan AI
    }
  ];
  fileMetadata: {
    pageCount?: number; // Jumlah halaman (untuk file PDF)
    fileSize?: number; // Ukuran file dalam byte
    createdDate?: Date; // Tanggal pembuatan file
  };
  createdAt: Date; // Waktu ketika knowledge base pertama kali dibuat
  updatedAt: Date; // Waktu saat ini atau ketika data diperbarui
}

const AiKnowledgeBaseSchema: Schema<IAiKnowledgeBase> = new Schema({
  userId: { type: String, required: true },
  channel: {
    type: String,
    enum: ["whatsapp", "instagram", "facebook", "telegram", "other"],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  fileUrl: { type: String },
  fileType: {
    type: String,
    enum: ["pdf", "csv", "json", "txt"],
  },
  contentType: {
    type: String,
    enum: ["text", "file"],
    required: true,
  },
  tags: { type: [String], default: [] },
  aiHistory: [
    {
      interactionDate: { type: Date, required: true },
      changes: { type: String, required: true },
    },
  ],
  fileMetadata: {
    pageCount: { type: Number },
    fileSize: { type: Number },
    createdDate: { type: Date },
  },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

// Pre-save hook to update `updatedAt`
AiKnowledgeBaseSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const AiKnowledgeBase: Model<IAiKnowledgeBase> =
  mongoose.model<IAiKnowledgeBase>("AiKnowledgeBase", AiKnowledgeBaseSchema);

export default AiKnowledgeBase;

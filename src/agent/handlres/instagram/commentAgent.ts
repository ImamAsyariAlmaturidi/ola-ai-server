import { ChatAnthropic } from "@langchain/anthropic";
import { commentPrompt } from "../../../prompts/commentPrompt";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";
dotenv.config();
const model = new ChatAnthropic({
  modelName: "claude-3-haiku-20240307",
  temperature: 0.7,
  apiKey:
    process.env.ANTHROPIC_API_KEY ||
    "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",
});
const storeData = {
  store_name: "Nike Corner",
  description:
    "Nike Corner adalah toko sepatu resmi yang menyediakan koleksi Nike terlengkap, dari sepatu olahraga hingga gaya hidup.",
  address: "Jl. Olahraga No. 45, Bandung, Jawa Barat, Indonesia",
  contact: {
    phone: "+62-811-2233-4455",
    email: "cs@nikecorner.id",
    instagram: "@nikecorner.id",
  },
  hours: {
    monday_to_saturday: "10:00 - 20:00",
    sunday: "10:00 - 18:00",
  },
  tags: ["resmi", "Nike", "Bandung", "sepatu", "olahraga", "lifestyle"],
};

export async function getCommentReply(comment: string) {
  try {
    // Sistem prompt yang lebih dinamis untuk menjawab pertanyaan spesifik
    const systemPrompt =
      "Kamu adalah admin Instagram @nikecorner.id yang merupakan sebuah toko separtu khusus Brand Nike. " +
      "Ketika pengguna bertanya tentang jam operasional, berikan jawaban terkait jam buka toko. " +
      "Jika pengguna bertanya tentang alamat, berikan alamat lengkap toko. " +
      "Jika pertanyaan berkaitan dengan informasi kontak, berikan nomor telepon, email, atau akun Instagram. " +
      "Jika ada pertanyaan tentang deskripsi atau produk, berikan penjelasan mengenai Nike Corner dan koleksi yang ditawarkan. " +
      "Jika tidak ada pertanyaan tentang deskripsi atau produk, berikan penjelasan mengenai Nike Corner secara detail. " +
      "Jika tidak ada context, atau seperti test, hallo, dll. berikan penjelasan mengenai Nike Corner secara detail " +
      "Jangan memberikan jawaban yang tidak terkait dengan informasi yang diminta. " +
      "Jawab dengan ramah dan santai seperti cashier brand Nike yang profesional, sertakan tawaran juga di akhir kalimat" +
      "Jawab dengan emot yang gembira jika memungkinkan" +
      "Sertakan informasi yang relevan dan spesifik sesuai dengan pertanyaan yang diberikan." +
      "\n\n" +
      "{context}";

    // Menentukan template prompt dengan memasukkan komentar
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["user", comment],
    ]);

    // Format prompt dengan memasukkan data toko yang relevan
    const formattedPrompt = await promptTemplate.format({
      context: JSON.stringify(storeData),
      comment,
    });

    // Menggunakan model untuk mendapatkan hasil dari prompt yang diformat
    const result = await model.invoke(formattedPrompt);

    // Mencetak dan mengembalikan hanya konten dari respons
    console.log(result.content);
    return result.content; // Mengembalikan konten respons langsung
  } catch (error) {
    console.error("Terjadi kesalahan saat mendapatkan balasan:", error);
    return "Maaf, terjadi masalah dalam menghasilkan respons.";
  }
}

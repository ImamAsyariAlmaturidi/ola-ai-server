import { Request, Response } from "express";
import AiKnowledgeBase from "../../models/AI/AiKnowledgeBase";
import { AuthRequest } from "../../middlewares/authMiddleware";

export default class AiKnowledgeBaseController {
  // Menyimpan Knowledge Base Baru atau Memperbarui Yang Ada
  static async saveKnowledgeBase(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const {
      channel,
      title,
      description,
      content,
      fileUrl,
      fileType,
      contentType,
      tags = [],
    } = req.body;

    const userId = req.user?._id;
    if (!userId || !channel || !title || !description || !contentType) {
      return res.status(400).json({
        error: "userId, channel, title, description, contentType are required",
      });
    }

    const uploadedFileUrl = req.file ? req.file.path : fileUrl;

    let knowledgeBase = await AiKnowledgeBase.findOne({
      userId,
      channel,
      title,
    });

    const baseData = {
      userId,
      channel,
      title,
      description,
      content,
      fileType,
      contentType,
      tags,
    };

    // Tambahkan fileUrl hanya jika ada
    const webhookPayload = uploadedFileUrl
      ? { ...baseData, fileUrl: uploadedFileUrl }
      : baseData;

    if (knowledgeBase) {
      knowledgeBase.description = description;
      knowledgeBase.content = content;
      knowledgeBase.fileUrl = uploadedFileUrl;
      knowledgeBase.fileType = fileType;
      knowledgeBase.contentType = contentType;
      knowledgeBase.tags = tags;
      await knowledgeBase.save();
    } else {
      knowledgeBase = new AiKnowledgeBase({
        userId,
        channel,
        title,
        description,
        content,
        fileUrl: uploadedFileUrl,
        fileType,
        contentType,
        tags,
      });
      await knowledgeBase.save();
    }

    try {
      await fetch("https://olaai.app.n8n.cloud/webhook-test/set-knowlegde", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });
    } catch (err) {
      console.error("Gagal memanggil webhook N8N:", err);
    }

    return res.status(knowledgeBase.isNew ? 201 : 200).json({
      message: knowledgeBase.isNew
        ? "Knowledge Base saved"
        : "Knowledge Base updated",
      data: knowledgeBase,
    });
  }

  // Mengambil Knowledge Base berdasarkan userId, channel, dan title
  static async getKnowledgeBase(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId, channel, title } = req.query;

      if (!userId || !channel || !title) {
        return res.status(400).json({
          error: "userId, channel, and title are required",
        });
      }

      const knowledgeBase = await AiKnowledgeBase.findOne({
        userId: userId.toString(),
        channel: channel.toString(),
        title: title.toString(),
      });

      if (!knowledgeBase) {
        return res.status(404).json({
          message: "Knowledge Base not found",
        });
      }

      return res.status(200).json({
        message: "Knowledge Base found",
        data: knowledgeBase,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }

  // Mengambil Semua Knowledge Base berdasarkan userId
  static async getAllKnowledgeBases(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          error: "userId is required",
        });
      }

      const knowledgeBases = await AiKnowledgeBase.find({
        userId: userId.toString(),
      });

      if (knowledgeBases.length === 0) {
        return res.status(404).json({
          message: "No Knowledge Bases found for this user",
        });
      }

      return res.status(200).json({
        message: "Knowledge Bases found",
        data: knowledgeBases,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }

  // Menghapus Knowledge Base
  static async deleteKnowledgeBase(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { userId, channel, title } = req.body;

      if (!userId || !channel || !title) {
        return res.status(400).json({
          error:
            "userId, channel, and title are required to delete the knowledge base",
        });
      }

      const knowledgeBase = await AiKnowledgeBase.findOneAndDelete({
        userId,
        channel,
        title,
      });

      if (!knowledgeBase) {
        return res.status(404).json({
          message: "Knowledge Base not found for deletion",
        });
      }

      return res.status(200).json({
        message: "Knowledge Base deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
}

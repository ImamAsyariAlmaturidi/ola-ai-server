import { Router, Response } from "express";
import AiKnowledgeBaseController from "../../controllers/AI/AiKnowlegdeBaseController";
import { authenticate, AuthRequest } from "../../middlewares/authMiddleware";

const router = Router();

// Menyimpan atau Memperbarui Knowledge Base
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  await AiKnowledgeBaseController.saveKnowledgeBase(req, res);
});

// Mengambil Knowledge Base berdasarkan userId, channel, dan title
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  await AiKnowledgeBaseController.getKnowledgeBase(req, res);
});

// Mengambil Semua Knowledge Base berdasarkan userId
router.get("/all", authenticate, async (req: AuthRequest, res: Response) => {
  await AiKnowledgeBaseController.getAllKnowledgeBases(req, res);
});

// Menghapus Knowledge Base berdasarkan userId, channel, dan title
router.delete("/", authenticate, async (req: AuthRequest, res: Response) => {
  await AiKnowledgeBaseController.deleteKnowledgeBase(req, res);
});

export default router;

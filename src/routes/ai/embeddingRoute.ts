import { Router, Request, Response } from "express";
import { EmbeddingController } from "../../controllers/ai/Embedding";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await EmbeddingController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await EmbeddingController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await EmbeddingController.findById(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await EmbeddingController.delete(req, res);
});

export default router;

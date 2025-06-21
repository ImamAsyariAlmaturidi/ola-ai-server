import { Router, Response } from "express";
import { KnowledgeSourceController } from "../../controllers/ai/knowledgeSource";
import { Request } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await KnowledgeSourceController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await KnowledgeSourceController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await KnowledgeSourceController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await KnowledgeSourceController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await KnowledgeSourceController.delete(req, res);
});

export default router;

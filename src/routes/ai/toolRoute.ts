import { Router, Request, Response } from "express";
import { AIToolController } from "../../controllers/ai/Tool";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await AIToolController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await AIToolController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await AIToolController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await AIToolController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await AIToolController.delete(req, res);
});

export default router;

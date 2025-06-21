import { Router, Request, Response } from "express";
import { TrainingSessionController } from "../../controllers/ai/TraningSession";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await TrainingSessionController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await TrainingSessionController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await TrainingSessionController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await TrainingSessionController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await TrainingSessionController.delete(req, res);
});

export default router;

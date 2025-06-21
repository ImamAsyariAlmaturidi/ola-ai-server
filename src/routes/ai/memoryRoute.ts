import { Router, Request, Response } from "express";
import { MemoryController } from "../../controllers/ai/Memory";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await MemoryController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await MemoryController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await MemoryController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await MemoryController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await MemoryController.delete(req, res);
});

export default router;

import { Router, Response } from "express";
import { AgentController } from "../../controllers/ai/Agent";
import { Request } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await AgentController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await AgentController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await AgentController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await AgentController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await AgentController.delete(req, res);
});

export default router;

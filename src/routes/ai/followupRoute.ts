import { Router, Request, Response } from "express";
import { FollowupController } from "../../controllers/ai/Followup";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await FollowupController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await FollowupController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await FollowupController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await FollowupController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await FollowupController.delete(req, res);
});

export default router;

import { Router, Request, Response } from "express";
import { ConversationController } from "../../controllers/ai/Conversation";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await ConversationController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await ConversationController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await ConversationController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await ConversationController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await ConversationController.delete(req, res);
});

export default router;

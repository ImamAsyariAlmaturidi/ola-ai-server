import { Router, Request, Response } from "express";
import { PromptTemplateController } from "../../controllers/ai/PromptTemplate";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await PromptTemplateController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await PromptTemplateController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await PromptTemplateController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await PromptTemplateController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await PromptTemplateController.delete(req, res);
});

export default router;

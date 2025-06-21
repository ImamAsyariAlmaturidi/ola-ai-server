import { Router, Request, Response } from "express";
import { IntegrationController } from "../../controllers/ai/Integration";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await IntegrationController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await IntegrationController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await IntegrationController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await IntegrationController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await IntegrationController.delete(req, res);
});

export default router;

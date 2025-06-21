import { Router, Response } from "express";
import { ActionController } from "../../controllers/ai/Action";
import { Request } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await ActionController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await ActionController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await ActionController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await ActionController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await ActionController.delete(req, res);
});

export default router;

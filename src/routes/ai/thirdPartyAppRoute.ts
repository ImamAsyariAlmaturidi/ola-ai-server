import { Router, Request, Response } from "express";
import { ThirdPartyAppController } from "../../controllers/ai/ThirdPartyApp";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  await ThirdPartyAppController.create(req, res);
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await ThirdPartyAppController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await ThirdPartyAppController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await ThirdPartyAppController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await ThirdPartyAppController.delete(req, res);
});

export default router;

import { Router, Response } from "express";
import { AuthController } from "../controllers/authController";
import { Request } from "express";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  await AuthController.register(req, res);
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  await AuthController.login(req, res);
});

export default router;

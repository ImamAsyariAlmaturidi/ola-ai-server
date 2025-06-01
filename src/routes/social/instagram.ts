// routes/instagram.ts
import { Router, Response } from "express";
import { InstagramController } from "../../controllers/instagram/instagramController";
import { authenticate, AuthRequest } from "../../middlewares/authMiddleware";

const router = Router();

router.get(
  "/comments",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    await InstagramController.getInstagramMediaComments(req, res);
  }
);

export default router;

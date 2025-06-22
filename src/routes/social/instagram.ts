// routes/instagram.ts
import { Router, Response } from "express";
import { InstagramController } from "../../controllers/instagram/instagramController";
import { authenticate, AuthRequest } from "../../middlewares/authMiddleware";

const router = Router();

router.get(
  "/oauth",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    await InstagramController.authInstagram(req, res);
  }
);

router.get(
  "/comments",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    await InstagramController.getInstagramMediaComments(req, res);
  }
);

router.post(
  "/comment-reply",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    await InstagramController.replyToInstagramComment(req, res);
  }
);

router.get(
  "/profile-dashboard",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    await InstagramController.getInstagramProfile(req, res);
  }
);

export default router;

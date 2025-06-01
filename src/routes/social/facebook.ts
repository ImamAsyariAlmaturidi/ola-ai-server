import express, { Request, Response } from "express";
import { FacebookPageController } from "../../controllers/facebook/facebookPageController";
import { authenticate, AuthRequest } from "../../middlewares/authMiddleware";

const router = express.Router();

router.use(authenticate);

router.get(
  "/facebook-pages",
  async (req: AuthRequest, res: Response): Promise<void> => {
    await FacebookPageController.getFacebookPages(req, res);
  }
);

router.put(
  "/facebook-pages/select",
  async (req: AuthRequest, res: Response): Promise<void> => {
    await FacebookPageController.selectFacebookPage(req, res);
  }
);

router.put(
  "/facebook-pages/unselect",
  async (req: AuthRequest, res: Response): Promise<void> => {
    await FacebookPageController.unselectFacebookPage(req, res);
  }
);

export default router;

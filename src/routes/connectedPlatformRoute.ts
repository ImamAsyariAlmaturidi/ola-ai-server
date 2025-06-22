// routes/connectedPlatformRoutes.ts
import { Router } from "express";
import ConnectedPlatformController from "../controllers/connectedPlatformController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticate,
  ConnectedPlatformController.getConnectedPlatforms
);

router.get(
  "/instagram/callback",
  ConnectedPlatformController.handleInstagramCallback
);

// Instagram
router.post(
  "/instagram",
  authenticate,
  ConnectedPlatformController.connectInstagram
);
router.delete(
  "/instagram/:accountId",
  authenticate,
  ConnectedPlatformController.disconnectInstagram
);

// WhatsApp
router.post(
  "/whatsapp",
  authenticate,
  ConnectedPlatformController.connectWhatsApp
);
router.delete(
  "/whatsapp/:accountId",
  authenticate,
  ConnectedPlatformController.disconnectWhatsApp
);

export default router;

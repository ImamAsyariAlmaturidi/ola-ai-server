import express from "express";
import { InstagramWebhookController } from "../../webhook/webhook";

const router = express.Router();

// GET: Verifikasi Webhook
router.get("/webhook", InstagramWebhookController.verify);

// POST: Terima event dari Instagram
router.post("/webhook", InstagramWebhookController.handle);

export default router;

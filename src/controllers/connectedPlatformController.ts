import { Request, Response } from "express";
import ConnectedPlatform from "../models/ConnectedPlatform";
import { AuthRequest } from "../middlewares/authMiddleware";

export default class ConnectedPlatformController {
  // ✅ Connect Instagram
  static async connectInstagram(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    await ConnectedPlatformController.connectGeneric("instagram", req, res);
  }

  // ✅ Disconnect Instagram
  static async disconnectInstagram(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    await ConnectedPlatformController.disconnectGeneric("instagram", req, res);
  }

  // ✅ Connect WhatsApp
  static async connectWhatsApp(req: AuthRequest, res: Response): Promise<void> {
    await ConnectedPlatformController.connectGeneric("whatsapp", req, res);
  }

  // ✅ Disconnect WhatsApp
  static async disconnectWhatsApp(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    await ConnectedPlatformController.disconnectGeneric("whatsapp", req, res);
  }

  // ✅ Ambil semua platform yang terkoneksi
  static async getConnectedPlatforms(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const platforms = await ConnectedPlatform.find({
        userId,
        isActive: true,
      });

      res.status(200).json({ data: platforms });
    } catch (error) {
      console.error("Get Connected Platforms Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // 📦 Generic connect (Instagram, WhatsApp, dll)
  static async connectGeneric(
    platform: "instagram" | "whatsapp",
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const {
        accountId,
        username,
        name,
        profilePictureUrl,
        accessToken,
        accessTokenExpiresAt,
      } = req.body;

      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const existing = await ConnectedPlatform.findOne({
        userId,
        accountId,
        platform,
      });

      if (existing) {
        await ConnectedPlatform.updateOne(
          { _id: existing._id },
          {
            $set: {
              username,
              name,
              profilePictureUrl,
              accessToken,
              accessTokenExpiresAt,
              isActive: true,
              lastSyncedAt: new Date(),
            },
          }
        );
        res.status(200).json({ message: `${platform} account updated` });
        return;
      }

      await ConnectedPlatform.create({
        userId,
        platform,
        accountId,
        username,
        name,
        profilePictureUrl,
        accessToken,
        accessTokenExpiresAt,
        isActive: true,
        connectedAt: new Date(),
      });

      res.status(201).json({ message: `${platform} account connected` });
    } catch (error) {
      console.error(`Connect ${platform} Error:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // 📦 Generic disconnect
  static async disconnectGeneric(
    platform: "instagram" | "whatsapp",
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { accountId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const existing = await ConnectedPlatform.findOne({
        userId,
        accountId,
        platform,
      });

      if (!existing) {
        res.status(404).json({ error: "Account not found" });
        return;
      }

      existing.isActive = false;
      await existing.save();

      res.status(200).json({ message: `${platform} account disconnected` });
    } catch (error) {
      console.error(`Disconnect ${platform} Error:`, error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

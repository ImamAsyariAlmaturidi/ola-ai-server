import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";
import jwt from "jsonwebtoken";
import ConnectedPlatform from "../models/ConnectedPlatform";
import { AuthRequest } from "../middlewares/authMiddleware";
import dotenv from "dotenv";
dotenv.config();
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

  // 📥 Instagram OAuth Callback
  static async handleInstagramCallback(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { code, state } = req.query;

      if (typeof code !== "string" || typeof state !== "string") {
        res.status(400).json({ error: "Missing or invalid code or state" });
        return;
      }

      // ✅ Decode user dari state token
      let user: any;
      try {
        user = jwt.verify(state, process.env.JWT_SECRET!);
      } catch {
        res.status(401).json({ error: "Invalid or expired state token" });
        return;
      }

      const client_id = process.env.INSTAGRAM_CLIENT_ID!;
      const client_secret = process.env.INSTAGRAM_CLIENT_SECRET!;
      const redirect_uri = process.env.INSTAGRAM_REDIRECT_URI!;

      console.log("🔁 Callback received with code:", code);
      console.log("🔐 Using redirect_uri:", redirect_uri);

      // ✅ Tukar authorization code jadi short-lived token
      const form = new FormData();
      form.append("client_id", client_id);
      form.append("client_secret", client_secret);
      form.append("grant_type", "authorization_code");
      form.append("redirect_uri", redirect_uri);
      form.append("code", code);

      const tokenRes = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        form,
        { headers: form.getHeaders() }
      );

      const shortToken = tokenRes.data.access_token;

      // ✅ Tukar short-lived token jadi long-lived token
      const longRes = await axios.get(
        "https://graph.instagram.com/access_token",
        {
          params: {
            client_id,
            client_secret,
            grant_type: "ig_exchange_token",
            access_token: shortToken,
          },
        }
      );

      const longToken = longRes.data.access_token;
      const expiresIn = longRes.data.expires_in;

      // (Opsional) Ambil username dari IG Graph API jika mau
      // const profileRes = await axios.get("https://graph.instagram.com/me", {
      //   params: { fields: "id,username", access_token: longToken },
      // });
      // const { id, username } = profileRes.data;

      (req as AuthRequest).user = { _id: user.id };
      (req as AuthRequest).body = {
        accountId: 1,
        username: "testuser", // ganti jika ambil dari profileRes
        name: "username",
        profilePictureUrl: null,
        accessToken: longToken,
        accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      };

      await ConnectedPlatformController.connectGeneric(
        "instagram",
        req as AuthRequest,
        res
      );
    } catch (error: any) {
      console.error("❌ Instagram OAuth Callback Error:", {
        message: error?.response?.data || error.message || error,
        params: {
          code: req.query.code,
          redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        },
      });
      res.status(500).json({ error: "Failed to connect Instagram" });
    }
  }
}

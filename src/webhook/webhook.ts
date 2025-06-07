import { Request, Response } from "express";
import dotenv from "dotenv";
import InstagramMedia from "../models/InstagramMedia";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";

import axios from "axios";
import User from "../models/User";
import InstagramProfile from "../models/InstagramProfile";
import InstagramComment from "../models/InstagramComment";
dotenv.config();

const AI_AGENT_WEBHOOK_COMMENT_URL = process.env.AI_AGENT_WEBHOOK_COMMENT_URL;
export class InstagramWebhookController {
  static verify(req: Request, res: Response): void {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "your_verify_token_here";

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  }

  static async handle(req: Request, res: Response): Promise<void> {
    const body = req.body;
    console.log("==> DAPAT POST WEBHOOK");
    console.dir(body, { depth: null });

    if (body.object === "instagram") {
      for (const entry of body.entry) {
        const changes = entry.changes || [];
        console.log(`🔔 DAPAT ${changes} CHANGES`);
        for (const change of changes) {
          if (change.field === "comments") {
            const {
              text: commentText,
              id: commentId,
              media,
              from,
            } = change.value;

            const mediaId = media?.id;
            const profileId = from?.id;
            const username = from?.username;

            const mediaData = await InstagramMedia.findOne({
              media_id: mediaId,
            });
            const userId = mediaData?.user_id;

            if (!userId) {
              console.warn(`⚠️ Gak nemu userId untuk mediaId: ${mediaId}`);
              return;
            }

            console.log(`✅ Dapet userId: ${userId} dari mediaId: ${mediaId}`);

            const isOwnAccount = await InstagramProfile.findOne({
              username,
              user_id: userId,
            });

            if (isOwnAccount) {
              const alreadyCommented = await InstagramComment.findOne({
                username,
                media_id: mediaId,
              });

              if (alreadyCommented) {
                console.log(
                  "⏭️ Akun sendiri udah pernah komen di media ini. Skip."
                );
                return;
              }
            }

            // 🧠 Lanjut proses kalau akun orang lain, atau akun sendiri tapi belum pernah komen
            const findUser = await User.findOne({ _id: userId });

            const token = jwt.sign(
              { _id: findUser?._id, email: findUser?.email },
              process.env.JWT_SECRET ?? "fallback",
              { expiresIn: "7d" }
            );

            try {
              await axios.post(`${AI_AGENT_WEBHOOK_COMMENT_URL}`, {
                userId: userId.toString(),
                channel: "instagram",
                interactionType: "greeting",
                message: commentText,
                profileId: profileId || "",
                commentId: commentId || "",
                mediaId: mediaId || "",
                username: username || "",
                token,
              });
            } catch (error) {
              console.error("❌ Error sending to n8n:", error);
            }
          }
        }
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  }
}

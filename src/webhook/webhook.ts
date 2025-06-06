import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
export class InstagramWebhookController {
  static verify(req: Request, res: Response): void {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "your_verify_token_here";

    console.log(VERIFY_TOKEN);
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
        for (const change of changes) {
          if (change.field === "comments") {
            const commentText = change.value.text;
            const commentId = change.value.id;

            try {
              //   await handleComment(commentText, commentId);
              console.log(`Handled comment: ${commentId}`);
            } catch (error) {
              console.error("Error handling comment:", error);
            }
          }
        }
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  }

  private static async handleComment(
    commentText: string,
    commentId: string
  ): Promise<void> {
    // Di sini kamu bisa panggil fungsi agent-mu
    console.log(`Processing comment "${commentText}" with ID: ${commentId}`);
    // await handleCommentAgent(commentText, commentId);
  }
}

import { Request, Response } from "express";
import { getCommentReply } from "../agent/handlres/instagram/commentAgent";

class Controller {
  static async responseComment(req: Request, res: Response): Promise<void> {
    try {
      const { comment } = req.body;
      if (!comment) {
        res.status(400).json({ error: "Comment required" });
        return;
      }

      try {
        const reply = await getCommentReply(comment);
        res.json({ reply });
      } catch (error) {
        console.error("Error processing comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (error) {
      // console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default Controller;

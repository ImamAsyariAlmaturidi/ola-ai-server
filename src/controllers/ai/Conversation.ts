import { Request, Response } from "express";
import Conversation from "../../models/ai/Conversation";

export class ConversationController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const conversation = await Conversation.create(req.body);
      res.status(201).json(conversation);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create conversation", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const conversations = await Conversation.find();
      res.status(200).json(conversations);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch conversations", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const conversation = await Conversation.findById(req.params.id);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.status(200).json(conversation);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch conversation", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await Conversation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update conversation", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Conversation.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.status(200).json({ message: "Conversation deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete conversation", details: error });
    }
  }
}

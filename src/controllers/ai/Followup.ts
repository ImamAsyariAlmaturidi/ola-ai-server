import { Request, Response } from "express";
import Followup from "../../models/ai/Followup";

export class FollowupController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const followup = await Followup.create(req.body);
      res.status(201).json(followup);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create follow-up", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const followups = await Followup.find();
      res.status(200).json(followups);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch follow-ups", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const followup = await Followup.findById(req.params.id);
      if (!followup) {
        res.status(404).json({ error: "Follow-up not found" });
        return;
      }
      res.status(200).json(followup);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch follow-up", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await Followup.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Follow-up not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update follow-up", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Followup.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Follow-up not found" });
        return;
      }
      res.status(200).json({ message: "Follow-up deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete follow-up", details: error });
    }
  }
}

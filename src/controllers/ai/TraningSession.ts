import { Request, Response } from "express";
import TrainingSession from "../../models/ai/TrainingSession";

export class TrainingSessionController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const session = await TrainingSession.create(req.body);
      res.status(201).json(session);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create training session", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await TrainingSession.find();
      res.status(200).json(sessions);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch training sessions", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const session = await TrainingSession.findById(req.params.id);
      res.status(200).json(session);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch training session", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await TrainingSession.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update training session", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      await TrainingSession.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Training session deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete training session", details: error });
    }
  }
}

import { Request, Response } from "express";
import AITool from "../../models/ai/Tool";

export class AIToolController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const tool = await AITool.create(req.body);
      res.status(201).json(tool);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create AI tool", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const tools = await AITool.find();
      res.status(200).json(tools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tools", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const tool = await AITool.findById(req.params.id);
      res.status(200).json(tool);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tool", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await AITool.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update tool", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      await AITool.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Tool deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tool", details: error });
    }
  }
}

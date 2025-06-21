import { Request, Response } from "express";
import Memory from "../../models/ai/Memory";

export class MemoryController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const memory = await Memory.create(req.body);
      res.status(201).json(memory);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create memory", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const memories = await Memory.find();
      res.status(200).json(memories);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch memories", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const memory = await Memory.findById(req.params.id);
      if (!memory) {
        res.status(404).json({ error: "Memory not found" });
        return;
      }
      res.status(200).json(memory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch memory", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await Memory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) {
        res.status(404).json({ error: "Memory not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update memory", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Memory.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Memory not found" });
        return;
      }
      res.status(200).json({ message: "Memory deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete memory", details: error });
    }
  }
}

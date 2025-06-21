import { Request, Response } from "express";
import KnowledgeSource from "../../models/ai/KnowledgeSource";

export class KnowledgeSourceController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const source = await KnowledgeSource.create(req.body);
      res.status(201).json(source);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create knowledge source", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const sources = await KnowledgeSource.find();
      res.status(200).json(sources);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch knowledge sources", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const source = await KnowledgeSource.findById(req.params.id);
      if (!source) {
        res.status(404).json({ error: "Knowledge source not found" });
        return;
      }
      res.status(200).json(source);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch knowledge source", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await KnowledgeSource.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Knowledge source not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update knowledge source", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await KnowledgeSource.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Knowledge source not found" });
        return;
      }
      res.status(200).json({ message: "Knowledge source deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete knowledge source", details: error });
    }
  }
}

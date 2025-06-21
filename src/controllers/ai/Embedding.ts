import { Request, Response } from "express";
import Embedding from "../../models/ai/Embedding";

export class EmbeddingController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const embedding = await Embedding.create(req.body);
      res.status(201).json(embedding);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create embedding", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const embeddings = await Embedding.find();
      res.status(200).json(embeddings);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch embeddings", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const embedding = await Embedding.findById(req.params.id);
      if (!embedding) {
        res.status(404).json({ error: "Embedding not found" });
        return;
      }
      res.status(200).json(embedding);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch embedding", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Embedding.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Embedding not found" });
        return;
      }
      res.status(200).json({ message: "Embedding deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete embedding", details: error });
    }
  }
}

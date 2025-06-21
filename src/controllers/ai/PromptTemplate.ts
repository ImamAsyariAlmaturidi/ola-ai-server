import { Request, Response } from "express";
import PromptTemplate from "../../models/ai/PromptTemplate";

export class PromptTemplateController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const template = await PromptTemplate.create(req.body);
      res.status(201).json(template);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create prompt template", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const templates = await PromptTemplate.find();
      res.status(200).json(templates);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch prompt templates", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const template = await PromptTemplate.findById(req.params.id);
      if (!template) {
        res.status(404).json({ error: "Prompt template not found" });
        return;
      }
      res.status(200).json(template);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch prompt template", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await PromptTemplate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Prompt template not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update prompt template", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await PromptTemplate.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Prompt template not found" });
        return;
      }
      res.status(200).json({ message: "Prompt template deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete prompt template", details: error });
    }
  }
}

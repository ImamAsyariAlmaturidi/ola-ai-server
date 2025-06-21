import { Request, Response } from "express";
import Integration from "../../models/ai/Integration";

export class IntegrationController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const integration = await Integration.create(req.body);
      res.status(201).json(integration);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create integration", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const integrations = await Integration.find();
      res.status(200).json(integrations);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch integrations", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const integration = await Integration.findById(req.params.id);
      if (!integration) {
        res.status(404).json({ error: "Integration not found" });
        return;
      }
      res.status(200).json(integration);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch integration", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await Integration.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) {
        res.status(404).json({ error: "Integration not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update integration", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Integration.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Integration not found" });
        return;
      }
      res.status(200).json({ message: "Integration deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete integration", details: error });
    }
  }
}

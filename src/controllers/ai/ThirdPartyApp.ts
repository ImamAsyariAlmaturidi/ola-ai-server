import { Request, Response } from "express";
import ThirdPartyApp from "../../models/ai/ThirdPartyApp";

export class ThirdPartyAppController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const app = await ThirdPartyApp.create(req.body);
      res.status(201).json(app);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create third-party app", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const apps = await ThirdPartyApp.find();
      res.status(200).json(apps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch apps", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const app = await ThirdPartyApp.findById(req.params.id);
      if (!app) {
        res.status(404).json({ error: "App not found" });
        return;
      }
      res.status(200).json(app);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch app", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await ThirdPartyApp.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update app", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await ThirdPartyApp.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "App deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete app", details: error });
    }
  }
}

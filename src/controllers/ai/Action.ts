import { Request, Response } from "express";
import Action from "../../models/ai/Action";

export class ActionController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const action = await Action.create(req.body);
      res.status(201).json(action);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create action", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const actions = await Action.find();
      res.status(200).json(actions);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch actions", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const action = await Action.findById(req.params.id);
      if (!action) {
        res.status(404).json({ error: "Action not found" });
        return;
      }
      res.status(200).json(action);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch action", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await Action.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) {
        res.status(404).json({ error: "Action not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update action", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Action.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Action not found" });
        return;
      }
      res.status(200).json({ message: "Action deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to delete action", details: error });
    }
  }
}

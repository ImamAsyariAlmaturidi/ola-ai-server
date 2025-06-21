import { Request, Response } from "express";
import Agent from "../../models/ai/Agent";

export class AgentController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const agent = await Agent.create(req.body);
      res.status(201).json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create agent", details: error });
    }
  }

  static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const agents = await Agent.find();
      res.status(200).json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents", details: error });
    }
  }

  static async findById(req: Request, res: Response): Promise<void> {
    try {
      const agent = await Agent.findById(req.params.id);
      if (!agent) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }
      res.status(200).json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent", details: error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await Agent.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agent", details: error });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await Agent.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }
      res.status(200).json({ message: "Agent deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent", details: error });
    }
  }
}

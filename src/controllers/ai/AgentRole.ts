import { Request, Response } from "express";
import AgentRole from "../../models/ai/AgentRole";

export class AgentRoleController {
  static async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!["default", "sales", "support", "closer"].includes(role)) {
        res.status(400).json({ error: "Invalid role" });
        return;
      }

      const updated = await AgentRole.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      );

      if (!updated) {
        res.status(404).json({ error: "Agent not found" });
        return;
      }

      res.status(200).json(updated);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to update agent role", details: error });
    }
  }

  static async findByRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.params;

      if (!["default", "sales", "support", "closer"].includes(role)) {
        res.status(400).json({ error: "Invalid role" });
        return;
      }

      const agents = await AgentRole.find({ role });
      res.status(200).json(agents);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch agents by role", details: error });
    }
  }
}

import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { AiAgent, AiAbility, AiIntegration } from "../../models/AI/index";

class AiAgentController {
  // CREATE AiAgent
  static async createAgent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        name,
        avatar,
        greeting,
        channels,
        languageStyle,
        ownerId,
        knowledgeBaseId,
        abilities,
        integrations,
        graph,
      } = req.body;

      const agent = new AiAgent({
        name,
        avatar,
        greeting,
        channels,
        languageStyle,
        ownerId,
        knowledgeBaseId,
        abilities,
        integrations,
        graph,
      });

      await agent.save();
      res.status(201).json(agent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // READ all AiAgents (optional filter by owner)
  static async getAgents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ownerId } = req.query;
      const filter = ownerId ? { ownerId } : {};
      const agents = await AiAgent.find(filter)
        .populate("abilities")
        .populate("integrations")
        .populate("knowledgeBaseId");
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // READ single AiAgent by id
  static async getAgentById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const agent = await AiAgent.findById(id)
        .populate("abilities")
        .populate("integrations")
        .populate("knowledgeBaseId");
      if (!agent) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // UPDATE AiAgent
  static async updateAgent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const agent = await AiAgent.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!agent) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // DELETE AiAgent
  static async deleteAgent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const agent = await AiAgent.findByIdAndDelete(id);
      if (!agent) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }
      res.json({ message: "Agent deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ACTIVATE / DEACTIVATE agent
  static async toggleAgentStatus(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { active } = req.body;
      if (typeof active !== "boolean") {
        res.status(400).json({ message: "active must be boolean" });
        return;
      }

      const agent = await AiAgent.findByIdAndUpdate(
        id,
        { active },
        { new: true }
      );
      if (!agent) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ASSIGN abilities (array of ability IDs)
  static async assignAbilities(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { abilityIds } = req.body;

      if (!Array.isArray(abilityIds)) {
        res.status(400).json({ message: "abilityIds must be an array" });
        return;
      }

      const abilities = await AiAbility.find({ _id: { $in: abilityIds } });
      if (abilities.length !== abilityIds.length) {
        res.status(404).json({ message: "Some abilities not found" });
        return;
      }

      const agent = await AiAgent.findByIdAndUpdate(
        id,
        { abilities: abilityIds },
        { new: true }
      );
      if (!agent) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }

      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // ASSIGN integrations (array of integration IDs)
  static async assignIntegrations(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { integrationIds } = req.body;

      if (!Array.isArray(integrationIds)) {
        res.status(400).json({ message: "integrationIds must be an array" });
        return;
      }

      const integrations = await AiIntegration.find({
        _id: { $in: integrationIds },
      });
      if (integrations.length !== integrationIds.length) {
        res.status(404).json({ message: "Some integrations not found" });
        return;
      }

      const agent = await AiAgent.findByIdAndUpdate(
        id,
        { integrations: integrationIds },
        { new: true }
      );
      if (!agent) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }

      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default AiAgentController;

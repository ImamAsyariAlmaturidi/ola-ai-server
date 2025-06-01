import { Request, Response } from "express";
class LangGraphController {
  static async runAgent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params; // id AI Agent
      // Ambil konfigurasi agent dan graph dari DB atau source lain
      //   const agentConfig = await getAgentConfigById(id); // contoh fungsi ambil config

      //   if (!agentConfig) {
      //     res.status(404).json({ message: "Agent not found" });
      //     return;
      //   }

      // Buat instance LangGraph dengan graph agent
      //   const langGraph = new LangGraph(agentConfig.graph);

      // Jalankan graph dengan input dari request
      //   const input = req.body.input || {};
      //   const result = await langGraph.run(input);

      //   res.json({ result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default LangGraphController;

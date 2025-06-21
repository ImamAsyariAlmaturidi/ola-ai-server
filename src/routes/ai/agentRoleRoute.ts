import { Router, Request, Response } from "express";
import { AgentRoleController } from "../../controllers/ai/AgentRole";

const router = Router();

// Ganti role agent
router.put("/:id/role", async (req: Request, res: Response): Promise<void> => {
  await AgentRoleController.updateRole(req, res);
});

// Cari agent berdasarkan role
router.get(
  "/role/:role",
  async (req: Request, res: Response): Promise<void> => {
    await AgentRoleController.findByRole(req, res);
  }
);

export default router;

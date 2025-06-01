import { Response, Router } from "express";
import AiPersonaController from "../../controllers/AI/AiPersonaController";
import { authenticate, AuthRequest } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  await AiPersonaController.saveAiPersona(req, res);
});

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  await AiPersonaController.getAiPersona(req, res);
});

export default router;

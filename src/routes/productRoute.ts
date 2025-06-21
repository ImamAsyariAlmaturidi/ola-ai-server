import { Router, Response } from "express";
import { ProductController } from "../controllers/productController";
import { Request } from "express";
// import { authenticate, AuthRequest } from "../middlewares/authMiddleware";

const router = Router();

router.post(
  "/",
  // authenticate, // kalau mau protek
  async (req: Request, res: Response): Promise<void> => {
    await ProductController.create(req, res);
  }
);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  await ProductController.findAll(req, res);
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  await ProductController.findById(req, res);
});

router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  await ProductController.update(req, res);
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  await ProductController.delete(req, res);
});

export default router;

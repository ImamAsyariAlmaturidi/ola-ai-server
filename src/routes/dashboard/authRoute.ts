import AuthController from "../../controllers/dashboard/authController";
import express from "express";

// Membuat router
const router = express.Router();

// Mendefinisikan route POST untuk menangani komentar
router.post("/createUser", AuthController.createUser);
router.post("/login", AuthController.requestCode);
router.post("/verify", AuthController.verifyCode);
// Mengekspor router untuk digunakan di tempat lain
export default router;

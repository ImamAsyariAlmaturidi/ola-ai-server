import InstagramController from "../../controllers/instagramController";
import express from "express";

// Membuat router
const router = express.Router();

// Mendefinisikan route POST untuk menangani komentar
router.post("/", InstagramController.responseComment);

// Mengekspor router untuk digunakan di tempat lain
export default router;

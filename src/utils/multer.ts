import multer from "multer";
import path from "path";

// Menyimpan file di memori
const storage = multer.memoryStorage();

// Filter untuk memastikan hanya tipe file tertentu yang diterima (misalnya PDF, CSV, JSON, atau TXT)
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /pdf|csv|json|txt/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // Izinkan file jika valid
  } else {
    // Membuat objek MulterError dan mengirimnya ke callback
    const error = new multer.MulterError(
      "LIMIT_UNEXPECTED_FILE",
      "Only PDF, CSV, JSON, or TXT files are allowed!"
    );
    return;
  }
};

// Batas ukuran file yang diupload (misalnya, maksimal 10MB)
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
};

// Middleware untuk menangani file upload
const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;

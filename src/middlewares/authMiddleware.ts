import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "coba ini aja dl";

export interface AuthRequest extends Request {
  user?: { _id: string; email: string };
  page_id?: string;
  ig_id?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      _id: string;
      email: string;
    };
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ meqssage: "Invalid or expired token" });
    return;
  }
};

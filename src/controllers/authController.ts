import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, businessName, phoneNumber } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      const user = await User.create({
        email,
        password,
        name,
        businessName,
        phoneNumber,
      });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      res.status(201).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: "Registration failed", details: error });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      res.status(200).json({ token, user });
    } catch (error) {
      res.status(500).json({ error: "Login failed", details: error });
    }
  }
}

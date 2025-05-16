import { Request, Response } from "express";
import User from "../../models/User";
import Verification from "../../models/Verification";
import jwt from "jsonwebtoken";
import { sendVerifyCode } from "../../utils/mailgun";
export default class AuthController {
  static async requestCode(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email required" });
      return;
    }

    try {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email, verified: false });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await Verification.create({
        userId: user._id,
        code,
        type: "login",
        expiredAt: new Date(Date.now() + 5 * 60 * 1000), // 5 menit
        used: false,
      });

      sendVerifyCode(email, code);
      res.status(200).json({ message: "Code generated", code });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async verifyCode(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ message: "Email and code required" });
      return;
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const verification = await Verification.findOne({
        userId: user._id,
        code,
        type: "login",
      });

      if (!verification) {
        res.status(400).json({ message: "Code not found" });
        return;
      }

      if (verification.used) {
        res.status(400).json({ message: "Code already used" });
        return;
      }

      if (verification.expiredAt.getTime() < Date.now()) {
        res.status(400).json({ message: "Code expired" });
        return;
      }

      // Tandai code sudah digunakan
      verification.used = true;
      await verification.save();

      // Update user jadi verified
      user.verified = true;
      await user.save();

      const token = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET ?? "coba ini aja dl",
        {
          expiresIn: "7d",
        }
      );

      res.status(200).json({
        message: "Verification success",
        user: {
          id: user._id,
          email: user.email,
          verified: user.verified,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email required" });
      return;
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(409).json({ message: "User already exists" });
        return;
      }

      const user = await User.create({ email, verified: false });

      res.status(201).json({
        message: "User created",
        user: {
          id: user._id,
          email: user.email,
          verified: user.verified,
        },
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

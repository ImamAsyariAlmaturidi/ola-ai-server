import { Request, Response } from "express";
import { Types } from "mongoose";
import FacebookPage from "../../models/FacebookPage";
import User from "../../models/User";
import { AuthRequest } from "../../middlewares/authMiddleware";

export class FacebookPageController {
  static async getFacebookPages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;

      const userWithPages = await User.aggregate([
        { $match: { _id: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: "facebookpages",
            localField: "_id",
            foreignField: "user_id",
            as: "facebookPages",
          },
        },
        {
          $project: {
            facebookPages: {
              $filter: {
                input: "$facebookPages",
                as: "page",
                cond: { $ne: ["$$page.ig_id", null] },
              },
            },
            facebookAccessToken: 1,
            email: 1,
          },
        },
      ]);

      if (!userWithPages.length)
        return res.status(404).json({ message: "User not found" });

      res.json(userWithPages[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async selectFacebookPage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { page_id, ig_id } = req.body;

      if (!page_id) return res.status(400).json({ message: "Missing page_id" });

      const page = await FacebookPage.findOne({ page_id, user_id: userId });
      if (!page) return res.status(404).json({ message: "Page not found" });

      page.is_selected = true;
      if (ig_id) page.ig_id = ig_id;
      page.updated_at = new Date();

      await page.save();

      res.json({ message: "Page selected", page });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async unselectFacebookPage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?._id;
      const { page_id } = req.body;

      if (!page_id) return res.status(400).json({ message: "Missing page_id" });

      const page = await FacebookPage.findOne({ page_id, user_id: userId });
      if (!page) return res.status(404).json({ message: "Page not found" });

      page.is_selected = false;
      page.updated_at = new Date();

      await page.save();

      res.json({ message: "Page unselected", page });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

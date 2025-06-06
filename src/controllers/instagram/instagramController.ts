// controllers/InstagramController.ts
import { Response } from "express";
import InstagramProfile from "../../models/InstagramProfile";
import InstagramMedia from "../../models/InstagramMedia";
import InstagramComment from "../../models/InstagramComment";
import FacebookPage from "../../models/FacebookPage";
import { getAvatarUrl } from "../../utils/dicebear";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { Types } from "mongoose";

export class InstagramController {
  static async getInstagramMediaComments(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const fbPage = await FacebookPage.findOne({
        user_id: userId,
        is_selected: true,
      });
      if (!fbPage || !fbPage.ig_id) return res.json([]);

      const mediaList = await InstagramMedia.find({ user_id: userId })
        .limit(20)
        .lean();

      const profile = await InstagramProfile.findOne({
        user_id: userId,
        ig_id: fbPage.ig_id,
      });
      if (!profile)
        return res.status(400).json({ message: "Instagram profile not found" });

      const commentLimit = 10;
      const replyLimit = 10;

      const results = [];

      for (const media of mediaList) {
        const comments = await InstagramComment.find({
          media_id: media.media_id,
          parent_comment_id: null,
        })
          .sort({ timestamp: -1 })
          .limit(commentLimit)
          .lean();

        const commentsWithAvatar = await Promise.all(
          comments.map(async (comment) => ({
            ...comment,
            avatar_url: await getAvatarUrl(
              comment.username,
              comment.username === profile.username
            ),
            isInternalUser: comment.username === profile.username,
          }))
        );

        const commentIds = commentsWithAvatar.map((c) => c.comment_id);
        const repliesRaw = await InstagramComment.aggregate([
          {
            $match: {
              parent_comment_id: { $in: commentIds },
              media_id: media.media_id,
            },
          },
          { $sort: { timestamp: 1 } },
          {
            $group: { _id: "$parent_comment_id", replies: { $push: "$$ROOT" } },
          },
          { $project: { replies: { $slice: ["$replies", replyLimit] } } },
        ]);

        const replies = await Promise.all(
          repliesRaw.map(async (group) => ({
            _id: group._id,
            replies: await Promise.all(
              group.replies.map(async (reply: any) => ({
                ...reply,
                avatar_url: await getAvatarUrl(
                  reply.username,
                  reply.username === profile.username
                ),
                isInternalUser: reply.username === profile.username,
              }))
            ),
          }))
        );

        const replyMap = Object.fromEntries(
          replies.map((r) => [r._id, r.replies])
        );

        const structuredComments = commentsWithAvatar.map((c) => ({
          ...c,
          replies: replyMap[c.comment_id] || [],
        }));

        results.push({ ...media, comments: structuredComments });
      }

      return res.json(results);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async getInstagramProfile(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Ambil Facebook Page yang dipilih
      const fbPage = await FacebookPage.findOne({
        user_id: new Types.ObjectId(userId),
        is_selected: true,
      });

      if (!fbPage || !fbPage.ig_id) {
        return res.status(400).json({ message: "Instagram ID not found" });
      }

      // Ambil data Instagram Profile dari database
      const profile = await InstagramProfile.findOne({
        user_id: userId,
        ig_id: fbPage.ig_id,
      }).lean();

      if (!profile) {
        return res
          .status(404)
          .json({ message: "Instagram profile not found in database" });
      }

      // Tambahkan avatar URL (opsional)
      const avatar_url = await getAvatarUrl(profile.username, true);

      return res.json({ ...profile, avatar_url });
    } catch (err) {
      console.error("[Get IG Profile Error]", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async replyToInstagramComment(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { commentId, message } = req.body;
    if (!commentId || !message)
      return res
        .status(400)
        .json({ message: "commentId and message are required" });

    try {
      const fbPage = await FacebookPage.findOne({
        user_id: new Types.ObjectId(userId),
        is_selected: true,
      });

      if (!fbPage || !fbPage.page_token)
        return res
          .status(400)
          .json({ message: "Facebook Page not found or no access token" });

      const igProfile = await InstagramProfile.findOne({
        user_id: userId,
        ig_id: fbPage?.ig_id,
      });

      if (!igProfile)
        return res.status(400).json({ message: "Instagram profile not found" });

      // Kirim reply ke Instagram Graph API
      const url = `https://graph.facebook.com/v22.0/${commentId}/replies`;
      const response = await fetch(url, {
        method: "POST",
        body: new URLSearchParams({
          message,
          access_token: fbPage.page_token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("[IG Reply Error]", result);
        return res
          .status(500)
          .json({ message: result.error?.message || "Failed to reply" });
      }

      // Opsional: simpan ke database kalau kamu track komentar lokal
      const parentComment = await InstagramComment.findOne({
        comment_id: commentId,
      });

      await InstagramComment.create({
        user_id: userId,
        media_id: parentComment?.media_id || null,
        comment_id: result.id,
        parent_comment_id: commentId,
        text: message,
        username: igProfile?.username || "your_ig_username",
        timestamp: new Date(),
        user_id_internal: userId || null,
      });

      return res.json({ success: true, data: result });
    } catch (err) {
      console.error("[Reply Error]", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

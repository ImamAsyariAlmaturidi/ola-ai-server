import { Response } from "express";
import InstagramProfile from "../../models/InstagramProfile";
import InstagramMedia from "../../models/InstagramMedia";
import InstagramComment from "../../models/InstagramComment";
import FacebookPage from "../../models/FacebookPage";
import { getAvatarUrl } from "../../utils/dicebear";
import { AuthRequest } from "../../middlewares/authMiddleware";

export class InstagramController {
  static async getInstagramMediaComments(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const fbPage = await FacebookPage.findOne({
        user_id: userId,
        is_selected: true,
      });
      if (!fbPage || !fbPage.ig_id) {
        return res.json([]);
      }

      const profile = await InstagramProfile.findOne({
        user_id: userId,
        ig_id: fbPage.ig_id,
      });
      if (!profile) {
        return res.status(400).json({ message: "Instagram profile not found" });
      }

      const mediaList = await InstagramMedia.find({ user_id: userId })
        .limit(20)
        .lean();

      const commentLimit = 10;
      const replyLimit = 10;

      const results = await Promise.all(
        mediaList.map(async (media) => {
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
              $group: {
                _id: "$parent_comment_id",
                replies: { $push: "$$ROOT" },
              },
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

          return { ...media, comments: structuredComments };
        })
      );

      return res.json(results);
    } catch (err) {
      console.error("Error in getInstagramMediaComments:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import commentRouter from "./routes/instagram/comment";
import axios from "axios";
import { connectMongo } from "./db/mongodb";
import { authenticate, AuthRequest } from "./middlewares/authMiddleware";
import {
  getAccessToken,
  getLongLivedAccessToken,
  refreshAccessToken,
  saveAccessTokenToRedis,
} from "./utils/tokenManager";

import { getCommentReply } from "./agent/handlres/instagram/commentAgent";
import authRouter from "./routes/dashboard/authRoute";
import FacebookPage from "./models/FacebookPage";
import { Types } from "mongoose";
import User from "./models/User";
import { decodeToken } from "./utils/jwt";
import cors from "cors";
import igFetchQueue from "./queues/igFetchQueue";

import "./queues/igFetchQueue";
import "./utils/cronJobs";
import InstagramMedia from "./models/InstagramMedia";
import InstagramProfile from "./models/InstagramProfile";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
  })
);
connectMongo();
app.use("/public", express.static("public"));
// Use Express built-in middleware instead of body-parser
app.use(express.json());

app.use("/auth", authRouter);

app.get(
  "/facebook-pages",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
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
            _id: 1,
            email: 1,
            facebookAccessToken: 1,
            facebookPages: {
              $filter: {
                input: "$facebookPages",
                as: "page",
                cond: { $ne: ["$$page.ig_id", null] },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            email: 1,
            facebookAccessToken: 1,
            facebookPages: {
              $map: {
                input: "$facebookPages",
                as: "page",
                in: {
                  fb_user_id: "$$page.fb_user_id",
                  page_id: "$$page.page_id",
                  page_name: "$$page.page_name",
                  ig_id: "$$page.ig_id",
                  is_selected: "$$page.is_selected",
                },
              },
            },
          },
        },
      ]);

      if (!userWithPages.length) {
        res.status(404).json({ message: "User not found." });
      } else {
        console.log(userWithPages[0]);
        res.json(userWithPages[0]);
      }
    } catch (err: any) {
      console.error("Error fetching facebook pages:", err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.post(
  "/unselect-facebook-page",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const { page_id } = req.body;

      console.log("Unselecting page_id:", page_id);
      const page = await FacebookPage.findOne({
        page_id,
        user_id: new Types.ObjectId(userId),
      });

      if (!page) {
        res.status(404).json({ message: "Page not found." });
        return;
      }

      page.is_selected = false;
      page.updated_at = new Date();
      await page.save();

      res.status(200).json({ message: "Page unselected successfully.", page });
    } catch (error) {
      console.log("Error unselecting Facebook page:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

app.post(
  "/select-facebook-page",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?._id;
      const { page_id, ig_id } = req.body;

      const page = await FacebookPage.findOne({
        page_id,
        user_id: new Types.ObjectId(userId),
      });
      if (!page) {
        res.status(404).json({ message: "Page not found." });
        return;
      }
      page.is_selected = true;
      page.ig_id = ig_id;
      page.updated_at = new Date();
      await page.save();
      res.status(200).json({ message: "Page selected successfully.", page });
    } catch (error) {
      console.log("Error selecting Facebook pages:", error);
    }
  }
);

app.get(
  "/instagram/profile-dashboard",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const selectedFbPage = await FacebookPage.findOne({
      user_id: userId,
      is_selected: true,
    });

    if (!selectedFbPage || !selectedFbPage.ig_id) {
      // Tidak ada Instagram yang aktif
      res.json([]);
    } else {
      const igProfile = await InstagramProfile.find({
        ig_id: selectedFbPage.ig_id,
        user_id: userId,
      });
      res.json(igProfile);
    }
  }
);

app.get("/instagram/:profileId/media", authenticate, async (req, res) => {
  const profileId = req.params.profileId;

  // ambil media Instagram yang sudah tersimpan untuk profileId ini
  const media = await InstagramMedia.find({ profile_id: profileId });

  res.json(media);
});

app.get("/callback", async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  const clientId = (req.query.client_id as string) || process.env.APP_ID;
  const clientSecret =
    (req.query.client_secret as string) || process.env.APP_SECRET;
  const redirectUri =
    (req.query.redirect_uri as string) || process.env.REDIRECT_URI;

  const state = req.query.state as string;

  if (!state) {
    res.status(400).send("Missing state parameter.");
    return;
  }

  const resultDecode = decodeToken(state);
  const userId = resultDecode?._id;

  if (!userId) {
    res.status(400).send("Invalid state token.");
    return;
  }

  if (!code) {
    res.status(400).send("Missing code parameter.");
    return;
  }

  if (!state) {
    res.status(400).send("Missing state parameter.");
    return;
  }

  if (!code || !clientId || !clientSecret || !redirectUri) {
    res.status(400).send("Missing required parameters.");
    return;
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    });

    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v22.0/oauth/access_token?${params.toString()}`
    );

    const accessToken = tokenResponse.data.access_token;
    const longAccessToken = await getLongLivedAccessToken(accessToken);
    const pagesRes = await axios.get(
      `https://graph.facebook.com/me/accounts?access_token=${longAccessToken}`
    );

    const pages = pagesRes.data.data;

    const pagesWithIG = await Promise.all(
      pages.map(async (page: any) => {
        const pageDetails = await axios.get(
          `https://graph.facebook.com/${page.id}?fields=name,instagram_business_account&access_token=${page.access_token}`
        );
        return {
          page_id: page.id,
          page_name: page.name,
          ig_id: pageDetails.data.instagram_business_account?.id || null,
          page_token: page.access_token,
        };
      })
    );

    const getUserProfileFacebook = await axios.get(
      `https://graph.facebook.com/me?fields=id,name&access_token=${longAccessToken}`
    );

    const fbUserId = getUserProfileFacebook.data.id;
    for (const page of pagesWithIG) {
      const existingPage = await FacebookPage.findOne({
        page_id: page.page_id,
      });

      if (existingPage) {
        existingPage.page_name = page.page_name;
        existingPage.page_token = page.page_token;
        existingPage.ig_id = page.ig_id;
        existingPage.updated_at = new Date();
        existingPage.user_id = new Types.ObjectId(userId);
        await existingPage.save();
      } else {
        const newPage = new FacebookPage({
          fb_user_id: fbUserId,
          page_id: page.page_id,
          page_name: page.page_name,
          page_token: page.page_token,
          ig_id: page.ig_id,
          user_id: new Types.ObjectId(userId),
          is_selected: false,
          created_at: new Date(),
          updated_at: new Date(),
        });
        await newPage.save();
      }
    }

    await User.findByIdAndUpdate(new Types.ObjectId(userId), {
      facebookAccessToken: longAccessToken,
    });

    const jobs = [];

    for (const page of pagesWithIG) {
      if (page.ig_id) {
        jobs.push(
          igFetchQueue.add("profile", {
            userId,
            igProfileId: page.ig_id,
            accessToken: page.page_token,
            jobType: "profile",
          }),
          igFetchQueue.add("media", {
            userId,
            igProfileId: page.ig_id,
            accessToken: page.page_token,
            jobType: "media",
          })
        );
      }
    }

    await Promise.all(jobs);
    res.redirect(
      `https://4cae-2a09-bac5-3a15-272d-00-3e7-87.ngrok-free.app/connect-account?success=true`
    );
  } catch (error: any) {
    console.log(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error getting access token.");
  }
});

// Handling POST requests for Instagram comments
app.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  const body = req.body;
  console.log("==> DAPAT POST WEBHOOK");
  console.dir(req.body, { depth: null });

  // Ensure it's an Instagram object in the payload
  if (body.object === "instagram") {
    for (const entry of body.entry) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "comments") {
          const commentText = change.value.text;
          const commentId = change.value.id;

          // Handle comment through agent or controller
          try {
            // Assuming 'handleCommentAgent' is a function that processes the comment
            await handleCommentAgent(commentText, commentId);
            console.log(`Handled comment: ${commentId}`);
          } catch (error) {
            console.error("Error handling comment:", error);
          }
        }
      }
    }

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Use comments router for handling comment-related routes
app.use("/comments", commentRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Function to handle comments via agent (or controller)
export async function handleCommentAgent(
  commentText: string,
  commentId: string
): Promise<void> {
  console.log(`💬 Processing comment: ${commentText} with ID: ${commentId}`);
  const lastCommentId = "18075388996889349";

  const replyMessageFromAI = await getCommentReply(commentText);
  console.log(replyMessageFromAI);
  let accessToken = await getAccessToken();

  if (!accessToken) {
    console.error("❌ No access token available.");
    return;
  }

  const url = `https://graph.facebook.com/v12.0/${lastCommentId}/replies`;

  try {
    await axios.post(url, {
      message: replyMessageFromAI,
      access_token: accessToken,
    });
    console.log("✅ Comment replied successfully!");
  } catch (error: any) {
    const err = error.response?.data?.error;
    if (err?.code === 190) {
      console.warn("⚠️ Token expired. Attempting refresh...");

      try {
        const refreshedToken = await refreshAccessToken();
        if (!refreshedToken) throw new Error("Gagal refresh token");

        await saveAccessTokenToRedis(refreshedToken);
        accessToken = refreshedToken;

        // Retry post
        await axios.post(url, {
          message: replyMessageFromAI,
          access_token: accessToken,
        });

        console.log("✅ Comment replied successfully with refreshed token!");
      } catch (refreshError) {
        console.error("❌ Failed to refresh token and reply:", refreshError);
      }
    } else {
      console.error("❌ Error replying comment:", err || error);
    }
  }
}

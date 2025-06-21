import express, { Request, Response } from "express";
import dotenv from "dotenv";

import axios from "axios";
import { connectMongo } from "./db/mongodb";
import {
  getAccessToken,
  getLongLivedAccessToken,
  refreshAccessToken,
  saveAccessTokenToRedis,
} from "./utils/tokenManager";

import "./queues/igFetchQueue";
import "./utils/cronJobs";

import { getCommentReply } from "./agent/handlres/instagram/commentAgent";

import FacebookPage from "./models/FacebookPage";
import { Types } from "mongoose";
import User from "./models/User";
import { decodeToken } from "./utils/jwt";
import cors from "cors";
import igFetchQueue from "./queues/igFetchQueue";

import InstagramMedia from "./models/InstagramMedia";
import AuthRoutes from "./routes/authRoute";
import ProductRoutes from "./routes/productRoute";
import FacebookRoutes from "./routes/social/facebook";
import InstagramRoutes from "./routes/social/instagram";
import KnowledgeSourceRoutes from "./routes/ai/knowledgeSourceRoute";
import ActionRoutes from "./routes/ai/actionRoute";
import AgentRoutes from "./routes/ai/agentRoute";
import AgentRoleRoutes from "./routes/ai/agentRoleRoute";
import ConversationRoutes from "./routes/ai/conversationRoute";
import EmbeddingRoutes from "./routes/ai/embeddingRoute";
import FollowupRoutes from "./routes/ai/followupRoute";
import IntegrationRoutes from "./routes/ai/integrationRoute";
import MemoryRoutes from "./routes/ai/memoryRoute";
import AIToolRoutes from "./routes/ai/toolRoute";
import PromptTemplateRoutes from "./routes/ai/promptTemplateRoute";
import TrainingSessionRoutes from "./routes/ai/trainingSessionRoute";
import multer from "multer";
import path from "path";
import instagramWebhookRouter from "./routes/webhook/instagramWebhookRoute";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
  })
);
connectMongo();
const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/public", express.static("public"));
// Use Express built-in middleware instead of body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/products", ProductRoutes);
app.use("/knowledge-sources", KnowledgeSourceRoutes);
app.use("/actions", ActionRoutes);
app.use("/agents", AgentRoutes);
app.use("/agent-roles", AgentRoleRoutes);
app.use("/conversations", ConversationRoutes);
app.use("/embeddings", EmbeddingRoutes);
app.use("/followups", FollowupRoutes);
app.use("/integrations", IntegrationRoutes);
app.use("/memories", MemoryRoutes);
app.use("/tools", AIToolRoutes);
app.use("/prompt-templates", PromptTemplateRoutes);
app.use("/instagram", instagramWebhookRouter);
app.use("/auth", AuthRoutes);
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

        // enqueue comments untuk semua media IG yang dimiliki user
        const allMedia = await InstagramMedia.find({ user_id: userId });

        for (const media of allMedia) {
          jobs.push(
            igFetchQueue.add("comments", {
              userId,
              igProfileId: page.ig_id,
              accessToken: page.page_token,
              jobType: "comments",
              extra: { media_id: media.media_id },
            })
          );
        }

        console.log(
          `[igFetchQueue] ✅ All comments success sync ${page.ig_id}.`
        );
      }
    }

    await Promise.all(jobs);
    const redirectUrlToConnectAccount = process.env.REDIRECT_URI_FRONTEND;
    res.redirect(`${redirectUrlToConnectAccount}`);
  } catch (error: any) {
    console.log(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error getting access token.");
  }
});

// Use comments router for handling comment-related routes
// Use social routes for Facebook and Instagram
app.use("/api/facebook", FacebookRoutes);
app.use("/api/instagram", InstagramRoutes);
//use AI routes for AI-related functionalities

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

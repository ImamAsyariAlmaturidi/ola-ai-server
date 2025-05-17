import express, { Request, Response } from "express";
import dotenv from "dotenv";
import commentRouter from "./routes/instagram/comment";
import axios from "axios";
import { connectMongo } from "./db/mongodb";
import {
  getAccessToken,
  getLongLivedAccessToken,
  refreshAccessToken,
  saveAccessTokenToRedis,
} from "./utils/tokenManager";
import crypto from "crypto";

import { getCommentReply } from "./agent/handlres/instagram/commentAgent";
import authRouter from "./routes/dashboard/authRoute";
dotenv.config();
const app = express();

connectMongo();
app.use("/public", express.static("public"));
// Use Express built-in middleware instead of body-parser
app.use(express.json());

app.use("/auth", authRouter);
app.get("/instagram/profile", async (req: Request, res: Response) => {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    // STEP 1: Dapetin user_id Instagram yang terhubung ke Facebook Page
    const userResponse = await axios.get(
      `https://graph.instagram.com/v22.0/me?fields=media`,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    // const pageId = userResponse.data.data[0].id;

    // // STEP 2: Ambil Instagram Business Account dari Page ID
    // const igAccountResponse = await axios.get(
    //   `https://graph.facebook.com/v18.0/${pageId}`,
    //   {
    //     params: {
    //       fields: "instagram_business_account",
    //       access_token: accessToken,
    //     },
    //   }
    // );

    // const instagramId = igAccountResponse.data.instagram_business_account.id;

    // // STEP 3: Ambil data Instagram profile
    // const profileResponse = await axios.get(
    //   `https://graph.facebook.com/v18.0/${instagramId}`,
    //   {
    //     params: {
    //       fields: "username,followers_count,media_count",
    //       access_token: accessToken,
    //     },
    //   }
    // );

    res.json(userResponse.data);
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch Instagram data" });
  }
});

app.get("/callback", async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  const clientId = (req.query.client_id as string) || process.env.APP_ID;
  const clientSecret =
    (req.query.client_secret as string) || process.env.APP_SECRET;
  const redirectUri =
    (req.query.redirect_uri as string) || process.env.INSTAGRAM_REDIRECT_URI;

  // console.log(code, clientId, clientSecret, redirectUri);
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
    res.json({
      message: "Access token retrieved successfully",
      accessToken,
      pages,
      pagesWithIG,
    });
  } catch (error: any) {
    console.log(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error getting access token.");
  }
});

// app.get("/callback", async (req: Request, res: Response): Promise<void> => {
//   const code = req.query.code as string;

//   if (!code) {
//     res.status(400).send("Authorization code not found.");
//   } else {
//     console.log("ini client id valid", process.env.INSTAGRAM_CLIENT_ID);
//     console.log("ini client secret valid", process.env.INSTAGRAM_CLIENT_SECRET);
//     console.log("ini redirect url valid", process.env.INSTAGRAM_REDIRECT_URI);

//     try {
//       const formData = new URLSearchParams();
//       formData.append("client_id", process.env.INSTAGRAM_CLIENT_ID!);
//       formData.append("client_secret", process.env.INSTAGRAM_CLIENT_SECRET!);
//       formData.append("grant_type", "authorization_code");
//       formData.append("redirect_uri", process.env.INSTAGRAM_REDIRECT_URI!);
//       formData.append("code", code);

//       const response = await axios.post(
//         "https://api.instagram.com/oauth/access_token",
//         formData
//       );

//       const shortLivedToken = response.data.access_token;
//       const userId = response.data.user_id;

//       const result = await axios.get(
//         "https://graph.instagram.com/access_token",
//         {
//           params: {
//             grant_type: "ig_exchange_token",
//             client_id: process.env.INSTAGRAM_CLIENT_ID, // Client ID dari Instagram
//             client_secret: process.env.INSTAGRAM_CLIENT_SECRET, // Client Secret dari Instagram
//             redirect_uri: process.env.INSTAGRAM_REDIRECT_URI, // URL redirect yang sama saat mendapatkan token
//             access_token: shortLivedToken, // Short-lived token yang kamu dapatkan
//           },
//         }
//       );

//       const accessToken = result.data.access_token;
//       console.log("Access Token:", accessToken);

//       // You can store this token in your database or session
//       res.send(`Access token: ${accessToken}<br>User ID: ${userId}`);
//     } catch (error: any) {
//       console.error(
//         "Error getting access token:",
//         error.response?.data || error.message
//       );
//       res.status(500).send("Failed to exchange code for access token.");
//     }
//   }
// });
// Webhook verification endpoint
app.get("/webhook", (req: Request, res: Response): void => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(mode, token, challenge);
  console.log("VERIFY_TOKEN", VERIFY_TOKEN);
  // Verify the token from Instagram webhook request
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    console.error("WEBHOOK_VERIFICATION_FAILED");
    res.sendStatus(403);
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

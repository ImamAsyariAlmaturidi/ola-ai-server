import { Queue, Worker, Job } from "bullmq";
import axios from "axios";
import InstagramProfile from "../models/InstagramProfile";
import InstagramMedia from "../models/InstagramMedia";
import InstagramComment from "../models/InstagramComment";
import InstagramDm from "../models/InstagramDm";
import connection from "../db/bullConnection";
import {
  getRandomExternalSeed,
  getRandomExternalBgColor,
  INTERNAL_USER_SEED,
  INTERNAL_BG_COLOR,
} from "../utils/dicebear"; // utils
export const igFetchQueue = new Queue("igFetchQueue", { connection });

export type IgFetchJobData = {
  userId: string;
  igProfileId: string;
  accessToken: string;
  jobType: "profile" | "media" | "comment" | "dm" | "comments";
  extra?: any;
};

const worker = new Worker<IgFetchJobData>(
  "igFetchQueue",
  async (job) => {
    const { userId, igProfileId, accessToken, jobType, extra } = job.data;

    try {
      switch (jobType) {
        case "profile":
          await fetchProfile(userId, igProfileId, accessToken);
          break;
        case "media":
          await fetchMedia(userId, igProfileId, accessToken, extra);
          break;
        case "comment":
          if (!extra?.media_id)
            throw new Error("media_id required for comment job");
          await fetchComments(userId, extra.media_id, accessToken, userId);
          break;
        case "dm":
          await fetchDM(userId, accessToken, extra);
          break;
        case "comments":
          if (!extra?.media_id)
            throw new Error("media_id required for comment job");
          await fetchCommentsForMedia(extra.media_id, accessToken, userId);
          break;
        default:
          throw new Error("Unknown jobType: " + jobType);
      }
    } catch (error) {
      console.error(
        `[igFetchQueue] Error in job ${job.id} (${jobType}):`,
        error
      );
      throw error; // supaya BullMQ bisa retry job sesuai policy
    }
  },
  { connection, concurrency: 4 }
);

console.log("[igFetchQueueWorker] Worker is running...");

async function fetchProfile(
  userId: string,
  igProfileId: string,
  accessToken: string
) {
  const res = await axios.get(
    `https://graph.facebook.com/v22.0/${igProfileId}`,
    {
      params: {
        fields:
          "id,username,profile_picture_url,followers_count,follows_count,biography",
        access_token: accessToken,
      },
    }
  );

  const data = res.data;

  await InstagramProfile.findOneAndUpdate(
    { ig_id: data.id },
    {
      username: data.username,
      profile_picture_url: data.profile_picture_url,
      followers_count: data.followers_count,
      follows_count: data.follows_count,
      biography: data.biography,
      website: data.website,
      is_verified: data.is_verified,
      user_id: userId,
      updated_at: new Date(),
    },
    { upsert: true }
  );

  console.log(`[igFetchQueue] Profile synced for IG ID ${data.id}`);
}

async function fetchMedia(
  userId: string,
  igProfileId: string,
  accessToken: string,
  extra?: { after?: string }
) {
  const params: any = {
    fields:
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments_count,like_count",
    access_token: accessToken,
    limit: 25,
  };
  if (extra?.after) params.after = extra.after;

  const res = await axios.get(
    `https://graph.facebook.com/v22.0/${igProfileId}/media`,
    { params }
  );
  const data = res.data;

  for (const media of data.data) {
    await InstagramMedia.findOneAndUpdate(
      { media_id: media.id },
      {
        user_id: userId,
        caption: media.caption,
        media_type: media.media_type,
        media_url: media.media_url,
        thumbnail_url: media.thumbnail_url,
        permalink: media.permalink,
        timestamp: new Date(media.timestamp),
        comments_count: media.comments_count,
        like_count: media.like_count,
        updated_at: new Date(),
      },
      { upsert: true }
    );
  }

  // Jika ada paging next, enqueue lagi job media dengan cursor 'after'
  if (data.paging?.cursors?.after) {
    await igFetchQueue.add("media", {
      userId,
      igProfileId,
      accessToken,
      jobType: "media",
      extra: { after: data.paging.cursors.after },
    });
  }

  console.log(`[igFetchQueue] Media batch synced for IG ID ${igProfileId}`);
}

async function fetchComments(
  userId: string,
  mediaId: string,
  accessToken: string,
  ownerUserId: string
) {
  const res = await axios.get(
    `https://graph.facebook.com/v22.0/${mediaId}/comments`,
    {
      params: {
        access_token: accessToken,
        fields: "id,text,username,timestamp",
        limit: 50,
      },
    }
  );

  const comments = res.data.data;
  for (const comment of comments) {
    await InstagramComment.findOneAndUpdate(
      { comment_id: comment.id },
      {
        media_id: mediaId,
        user_id: ownerUserId,
        comment_text: comment.text,
        username: comment.username,
        timestamp: new Date(comment.timestamp),
        updated_at: new Date(),
      },
      { upsert: true }
    );
  }

  console.log(`[igFetchQueue] Comments synced for media ID ${mediaId}`);
}

async function fetchCommentsForMedia(
  mediaId: string,
  accessToken: string,
  ownerUserId: string
) {
  let url = `https://graph.facebook.com/v22.0/${mediaId}/comments`;

  while (url) {
    const res = await axios.get(url, {
      params: {
        access_token: accessToken,
        fields: "id,text,username,timestamp",
        limit: 50,
      },
    });

    const comments = res.data.data;
    const paging = res.data.paging;

    for (const comment of comments) {
      const isInternalUser = false;

      const avatar_seed = isInternalUser
        ? INTERNAL_USER_SEED
        : getRandomExternalSeed();

      const avatar_bg_color = isInternalUser
        ? INTERNAL_BG_COLOR
        : getRandomExternalBgColor();

      await InstagramComment.findOneAndUpdate(
        { comment_id: comment.id },
        {
          media_id: mediaId,
          user_id_internal: ownerUserId,
          text: comment.text,
          username: comment.username,
          timestamp: new Date(comment.timestamp),
          parent_comment_id: null,
          avatar_seed,
          avatar_bg_color,
          updated_at: new Date(),
        },
        { upsert: true }
      );

      await fetchRepliesForComment(
        comment.id,
        accessToken,
        ownerUserId,
        mediaId
      );
    }

    url = paging?.next || null;
  }
  console.log(`[igFetchQueue] Comments Reply synced for MEDIA`);
}

async function fetchRepliesForComment(
  commentId: string,
  accessToken: string,
  ownerUserId: string,
  mediaId: string
) {
  let url = `https://graph.facebook.com/v22.0/${commentId}/replies`;

  while (url) {
    const res = await axios.get(url, {
      params: {
        access_token: accessToken,
        fields: "id,text,username,timestamp",
        limit: 50,
      },
    });

    const replies = res.data.data;
    const paging = res.data.paging;

    for (const reply of replies) {
      const isInternalUser = false;

      const avatar_seed = isInternalUser
        ? INTERNAL_USER_SEED
        : getRandomExternalSeed();

      const avatar_bg_color = isInternalUser
        ? INTERNAL_BG_COLOR
        : getRandomExternalBgColor();

      await InstagramComment.findOneAndUpdate(
        { comment_id: reply.id },
        {
          media_id: mediaId,
          user_id_internal: ownerUserId,
          text: reply.text,
          username: reply.username,
          timestamp: new Date(reply.timestamp),
          parent_comment_id: commentId,
          avatar_seed,
          avatar_bg_color,
          updated_at: new Date(),
        },
        { upsert: true }
      );
    }

    url = paging?.next || null;
  }

  console.log(`[igFetchQueue] Replies synced for comment`);
}

async function fetchDM(userId: string, accessToken: string, extra?: any) {
  console.log(`[igFetchQueue] Fetch DM not implemented yet for user ${userId}`);
}

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

export default igFetchQueue;

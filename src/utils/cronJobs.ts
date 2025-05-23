import cron from "node-cron";
import FacebookPage from "../models/FacebookPage";
import InstagramMedia from "../models/InstagramMedia";
import { igFetchQueue } from "../queues/igFetchQueue";

async function enqueueJobs(jobType: string) {
  const pages = await FacebookPage.find({ is_selected: true });
  for (const page of pages) {
    if (jobType === "comments") {
      // Ambil semua media dari IG profile terkait user/page
      const mediaList = await InstagramMedia.find({
        user_id: page.user_id,
        ig_id: page.ig_id,
      });

      // Untuk tiap media enqueue job comments
      for (const media of mediaList) {
        await igFetchQueue.add(jobType, {
          userId: page.user_id?.toString() || "unknown",
          igProfileId: page.ig_id,
          accessToken: page.page_token,
          jobType,
          extra: { mediaId: media.media_id }, // pastikan mediaId benar
        });
      }
    } else {
      // Untuk job selain comments, enqueue satu job per page
      await igFetchQueue.add(jobType, {
        userId: page.user_id?.toString() || "unknown",
        igProfileId: page.ig_id,
        accessToken: page.page_token,
        jobType,
      });
    }
  }
}

cron.schedule("*/10 * * * *", async () => {
  console.log("[Cron] Enqueue profile jobs");
  await enqueueJobs("profile");
});

cron.schedule("*/15 * * * *", async () => {
  console.log("[Cron] Enqueue media jobs");
  await enqueueJobs("media");
});

cron.schedule("*/15 * * * *", async () => {
  console.log("[Cron] Enqueue comments jobs");
  await enqueueJobs("comments");
});

console.log("[igFetchCron] Cron jobs are scheduled...");

// Cron job dm (jika mau aktifkan, hilangkan comment)
// cron.schedule("* * * * *", async () => {
//   console.log("[Cron] Enqueue dm jobs");
//   await enqueueJobs("dm");
// });

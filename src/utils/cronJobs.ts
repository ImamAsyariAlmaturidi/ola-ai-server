import cron from "node-cron";
import FacebookPage from "../models/FacebookPage";
import { igFetchQueue } from "../queues/igFetchQueue";

async function enqueueJobs(jobType: string) {
  const pages = await FacebookPage.find({ is_selected: true });
  for (const page of pages) {
    await igFetchQueue.add(jobType, {
      userId: page.user_id?.toString() || "unknown",
      igProfileId: page.ig_id,
      accessToken: page.page_token,
      jobType,
    });
  }
}

cron.schedule("*/10 * * * *", async () => {
  console.log("[Cron] Enqueue profile jobs");
  await enqueueJobs("profile");
});

// Semua schedule
console.log("[igFetchCron] Cron jobs are scheduled...");

// Cron job media tiap 10 menit sekali
cron.schedule("*/15 * * * *", async () => {
  console.log("[Cron] Enqueue media jobs");
  await enqueueJobs("media");
});

// Semua schedule
// console.log("[igFetchCron] Cron jobs are scheduled...");

// // Cron job comment tiap 15 menit sekali
// cron.schedule("* * * * *", async () => {
//   console.log("[Cron] Enqueue comment jobs");
//   await enqueueJobs("comment");
// });

// Semua schedule
// console.log("[igFetchCron] Cron jobs are scheduled...");

// Cron job dm tiap 10 menit sekali
// cron.schedule("* * * * *", async () => {
//   console.log("[Cron] Enqueue dm jobs");
//   await enqueueJobs("dm");
// });

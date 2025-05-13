// db/redis.ts
import { createClient } from "redis";

const client = createClient();

let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("🔌 Redis connected!");
  }
  return client;
}

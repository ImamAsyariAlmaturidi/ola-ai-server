import axios from "axios";
import { getRedisClient } from "../db/redis"; // Pastikan koneksi Redis sudah diatur

// Fungsi untuk mendapatkan long-lived access token dari Facebook
export async function getLongLivedAccessToken(
  shortLivedToken: string
): Promise<string> {
  const url = `https://graph.facebook.com/v12.0/oauth/access_token`;
  try {
    const response = await axios.get(url, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.APP_ID, // Ganti dengan Facebook App ID
        client_secret: process.env.APP_SECRET, // Ganti dengan Facebook App Secret
        fb_exchange_token: shortLivedToken,
      },
    });
    const longLivedToken = response.data.access_token;
    console.log("🔑 Long-lived access token generated!");
    return longLivedToken;
  } catch (error) {
    console.error("❌ Failed to generate long-lived access token:", error);
    throw new Error("Unable to generate long-lived access token");
  }
}

// Fungsi untuk menyimpan token ke Redis
export async function saveAccessTokenToRedis(token: string) {
  const client = await getRedisClient();
  await client.setEx("access_token", 3600, token); // Menyimpan dengan TTL 1 jam
  console.log("✅ Access token saved to Redis!");
}

export async function getAccessToken(): Promise<string | null> {
  const client = await getRedisClient();

  // ✅ Await di sini biar dapet string, bukan Promise<string>
  let accessToken = await client.get("access_token");

  if (!accessToken) {
    console.error("❌ Access token not found in Redis");
    return null;
  }

  // ✅ Validasi token
  const isValid = await validateAccessToken(accessToken);
  if (!isValid) {
    console.warn("⚠️ Token invalid or expired, refreshing...");

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      console.error("❌ Failed to refresh access token");
      return null;
    }

    // ✅ Simpan token baru ke Redis
    await client.set("access_token", refreshedToken);
    accessToken = refreshedToken;
  }

  return accessToken;
}

async function validateAccessToken(token: string): Promise<boolean> {
  try {
    const result = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: {
        input_token: token,
        access_token: `${process.env.APP_ID}|${process.env.APP_SECRET}`,
      },
    });
    return result.data.data.is_valid;
  } catch (error) {
    return false;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const client = await getRedisClient();
    const refreshToken = await client.get("refresh_token");
    if (!refreshToken) {
      console.error("❌ Refresh token not found in Redis");
      return null;
    }

    const response = await axios.get(
      "https://graph.facebook.com/v12.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          fb_exchange_token: refreshToken,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to refresh token", error);
    return null;
  }
}

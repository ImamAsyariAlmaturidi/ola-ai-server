import { Types } from "mongoose";
import InstagramProfile from "../models/InstagramProfile";

const USER_SEEDS = [
  "Aiden",
  "George",
  "Alexander",
  "Aidan",
  "Emery",
  "Eliza",
  "Jack",
  "Jameson",
  "Jessica",
  "Jade",
  "Adrian",
  "Jocelyn",
  "Katherine",
  "Kimberly",
  "Jude",
  "Kingston",
  "Liam",
  "Leah",
  "Andrea",
  "Amaya",
];

const USER_EXTERNAL_BG_COLORS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc"];
export const INTERNAL_USER_SEED = "felix";
export const INTERNAL_BG_COLOR = "ffdfbf";

export function getRandomExternalSeed() {
  const idx = Math.floor(Math.random() * USER_SEEDS.length);
  return USER_SEEDS[idx];
}

export function getRandomExternalBgColor() {
  const idx = Math.floor(Math.random() * USER_EXTERNAL_BG_COLORS.length);
  return USER_EXTERNAL_BG_COLORS[idx];
}

export async function getAvatarUrl(
  username: string,
  isInternalUser: boolean
): Promise<string> {
  if (isInternalUser) {
    const profile = await InstagramProfile.findOne({
      username: username,
    }).lean();
    if (profile?.profile_picture_url) {
      return profile.profile_picture_url;
    }
    // fallback kalau internal tapi belum punya profile picture
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${INTERNAL_USER_SEED}&backgroundColor=${INTERNAL_BG_COLOR}`;
  }

  // user eksternal
  const seed = getRandomExternalSeed();
  const bg = getRandomExternalBgColor();
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=${bg}`;
}

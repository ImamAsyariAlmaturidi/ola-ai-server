import { ChatAnthropic } from "@langchain/anthropic";
import { commentPrompt } from "../../../prompts/commentPrompt";
import dotenv from "dotenv";
dotenv.config();
const model = new ChatAnthropic({
  modelName: "claude-3-haiku-20240307",
  temperature: 0.7,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getCommentReply(comment: string) {
  const prompt = await commentPrompt.format({ comment });
  const result = await model.invoke(prompt);
  return result.content;
}

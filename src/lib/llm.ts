import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

export function getModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(process.env.GOOGLE_MODEL || "gemini-3.8-flash");
  }
  if (process.env.OPENAI_API_KEY) {
    return openai(process.env.OPENAI_MODEL || "gpt-4o-mini");
  }
  throw new Error(
    "Set GOOGLE_GENERATIVE_AI_API_KEY (free Gemini) or OPENAI_API_KEY in .env.local"
  );
}

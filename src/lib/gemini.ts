import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in the environment.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const CHAT_MODEL = "gemini-1.5-flash";

export interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

export async function sendMessage(history: ChatMessage[], message: string) {
  try {
    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: [...history, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are a friendly, informal gaming expert and friend. You help the user with game configurations, performance optimizations, FPS tweaks, and finding the best settings for any game. Use a casual 'gamer' tone. If unsure, use your search tools.",
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

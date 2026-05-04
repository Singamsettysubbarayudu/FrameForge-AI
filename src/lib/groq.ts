import OpenAI from "openai";

// Accessing API key safely for both development and production
const apiKey = typeof process !== 'undefined' ? process.env.GROQ_API_KEY : (import.meta as any).env?.VITE_GROQ_API_KEY;

export const groq = new OpenAI({
  apiKey: apiKey || "dummy-key", // Provide a dummy key to prevent immediate crash
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";

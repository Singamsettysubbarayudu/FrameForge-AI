import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY;

export const groq = new OpenAI({
  apiKey: apiKey || "",
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true // Necessary for client-side usage
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";

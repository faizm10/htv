import { GoogleGenerativeAI } from "@google/generative-ai";

const KEY = process.env.GEMINI_API_KEY;
const genAI = KEY ? new GoogleGenerativeAI(KEY) : null;

async function callGemini(prompt: string) {
  if (!genAI) {
    return {
      response: {
        text: () => "🔮 (mock) I'm out of ectoplasm. Use this: 'Hey! Ramen or tacos? I'm free Thu 7–9 — pick one?'"
      }
    };
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result;
}

export async function generateRewrite(ctx: { draft: string; lastTurns: string[] }) {
  const p = `Rewrite my draft into 3 short variants (casual | playful | concise), <=120 chars. 
Rules: add at most 1 question if natural, avoid love-bombing, no emojis if tone is formal.
Draft: ${ctx.draft}
Last turns: ${ctx.lastTurns.join("\n")}`;
  const res = await callGemini(p);
  const text = res.response?.text?.() ?? "";
  return text.split(/\n+/).slice(0, 3);
}

export async function generateNudge(ctx: { context: string }) {
  const p = `Produce 3 low-risk nudges with 2 concrete options and an easy opt-out. <=120 chars. Context: ${ctx.context}`;
  const res = await callGemini(p);
  const text = res.response?.text?.() ?? "";
  return text.split(/\n+/).slice(0, 3);
}

export async function generateExit() {
  const p = `Polite exit message, <=140 chars, neutral:`;
  const res = await callGemini(p);
  const text = res.response?.text?.() ?? "";
  return [text.trim() || "Thanks for the chat! Take care."];
}

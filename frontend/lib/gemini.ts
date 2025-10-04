import { GoogleGenerativeAI } from "@google/generative-ai";

const KEY = process.env.GEMINI_API_KEY;
const genAI = KEY ? new GoogleGenerativeAI(KEY) : null;

async function callGemini(prompt: string) {
  if (!genAI) {
    // Mock responses for demo
    const mockResponses = {
      rewrite: [
        "Hey! Ramen or tacos? I'm free Thu 7–9 — pick one?",
        "What's up! Want to grab dinner Thursday? I'm thinking ramen or tacos 🍜🌮",
        "Free Thu 7-9. Ramen or tacos? Your choice!"
      ],
      nudge: [
        "Hey! Coffee or drinks this week? No worries if you're swamped ☕",
        "Want to catch up soon? I'm free Wed/Thu evening if you are 😊",
        "How's it going? Free for a quick coffee this week? No pressure!"
      ],
      exit: "Hey, I've been thinking and I think we should take a step back from this. I appreciate the time we've spent together, but I don't feel like we're a good match. Wishing you all the best! 🙏"
    };
    
    return { 
      text: () => {
        if (prompt.includes('Rewrite')) return mockResponses.rewrite.join('\n');
        if (prompt.includes('nudges')) return mockResponses.nudge.join('\n');
        if (prompt.includes('exit')) return mockResponses.exit;
        return "🔮 (mock) I'm out of ectoplasm. Use this: 'Hey! Ramen or tacos? I'm free Thu 7–9 — pick one?'";
      }
    };
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  return model.generateContent(prompt);
}

export async function generateRewrite(ctx: { draft: string, lastTurns: string[], vibe?: string }) {
  const vibeInstruction = ctx.vibe ? `Rewrite in a ${ctx.vibe.toLowerCase()} tone.` : 'Rewrite into 3 short variants (casual | playful | concise).';
  
  const prompt = `Rewrite my draft into 3 short variants, <=120 chars each. 
${vibeInstruction}
Rules: add at most 1 question if natural, avoid love-bombing, no emojis if tone is formal.
Draft: ${ctx.draft}
Last turns: ${ctx.lastTurns.join("\n")}`;
  
  try {
    const res = await callGemini(prompt);
    const text = (await res).text?.() ?? "";
    return text.split(/\n+/).slice(0, 3).filter(line => line.trim());
  } catch (error) {
    console.error('Gemini rewrite error:', error);
    return [
      "Hey! Ramen or tacos? I'm free Thu 7–9 — pick one?",
      "What's up! Want to grab dinner Thursday? I'm thinking ramen or tacos 🍜🌮",
      "Free Thu 7-9. Ramen or tacos? Your choice!"
    ];
  }
}

export async function generateNudge(ctx: { context: string }) {
  const prompt = `Produce 3 low-risk nudges with 2 concrete options and an easy opt-out. <=120 chars each. Context: ${ctx.context}`;
  
  try {
    const res = await callGemini(prompt);
    const text = (await res).text?.() ?? "";
    return text.split(/\n+/).slice(0, 3).filter(line => line.trim());
  } catch (error) {
    console.error('Gemini nudge error:', error);
    return [
      "Hey! Coffee or drinks this week? No worries if you're swamped ☕",
      "Want to catch up soon? I'm free Wed/Thu evening if you are 😊",
      "How's it going? Free for a quick coffee this week? No pressure!"
    ];
  }
}

export async function generateExit() {
  const prompt = `Polite exit message, <=140 chars, neutral tone:`;
  
  try {
    const res = await callGemini(prompt);
    const text = (await res).text?.() ?? "";
    return [text.trim()];
  } catch (error) {
    console.error('Gemini exit error:', error);
    return ["Hey, I've been thinking and I think we should take a step back from this. I appreciate the time we've spent together, but I don't feel like we're a good match. Wishing you all the best! 🙏"];
  }
}

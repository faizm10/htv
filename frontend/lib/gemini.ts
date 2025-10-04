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

export async function generateRewrite(ctx: { draft: string, lastTurns: string[] }) {
  const prompt = `Rewrite my draft into 3 short variants (casual | playful | concise), <=120 chars each. 
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

export async function generateNextWord(ctx: { 
  currentText: string, 
  conversationContext: string[], 
  maxWords?: number
}): Promise<Array<{ word: string; confidence: number }>> {
  const maxWords = ctx.maxWords || 3;
  const prompt = `Predict the next ${maxWords} most likely words to continue this sentence naturally.

Context from recent messages: ${ctx.conversationContext.join(' | ')}
Current sentence: "${ctx.currentText}"

Return as JSON array with format:
[
  {"word": "next_word", "confidence": 0.9},
  {"word": "alternative_word", "confidence": 0.8}
]

Rules:
- Provide single words or short phrases (1-3 words max)
- Confidence 0.5-1.0 (higher = more likely)
- Keep it conversational and natural
- Match the tone and context
- Consider grammar and sentence flow
- If sentence seems complete, suggest continuation words like "and", "but", "so"`;

  try {
    const res = await callGemini(prompt);
    const text = (await res).text?.() ?? "";
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, maxWords);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON, falling back to text parsing');
    }
    
    // Fallback: parse text response
    const lines = text.split('\n').filter(line => line.trim());
    return lines.slice(0, maxWords).map((line, index) => ({
      word: line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim(),
      confidence: Math.max(0.5, 0.9 - index * 0.1)
    }));
    
  } catch (error) {
    console.error('Gemini next word error:', error);
    
    // Smart fallback based on current text
    const text = ctx.currentText.toLowerCase().trim();
    const lastWord = text.split(/\s+/).pop() || '';
    
    // Common word patterns
    if (text.endsWith('i am') || text.endsWith('i\'m')) {
      return [
        { word: 'going', confidence: 0.9 },
        { word: 'feeling', confidence: 0.8 },
        { word: 'trying', confidence: 0.7 }
      ];
    }
    
    if (text.endsWith('going')) {
      return [
        { word: 'to', confidence: 0.9 },
        { word: 'for', confidence: 0.8 },
        { word: 'out', confidence: 0.7 }
      ];
    }
    
    if (text.endsWith('want to')) {
      return [
        { word: 'go', confidence: 0.9 },
        { word: 'see', confidence: 0.8 },
        { word: 'do', confidence: 0.7 }
      ];
    }
    
    if (text.endsWith('how are')) {
      return [
        { word: 'you', confidence: 0.9 },
        { word: 'things', confidence: 0.8 },
        { word: 'we', confidence: 0.7 }
      ];
    }
    
    // Default suggestions
    return [
      { word: 'you', confidence: 0.8 },
      { word: 'the', confidence: 0.7 },
      { word: 'and', confidence: 0.6 }
    ];
  }
}

// frontend/lib/gemini.ts
// This safely runs in the browser and talks to your API route.

async function callGeminiAPI(prompt: string) {
  try {
    console.log('🚀 Making request to /api/generate...');
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    console.log('📡 Response status:', res.status);
    console.log('📡 Response URL:', res.url);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Gemini API error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log('✅ API Response received:', data);
    return data.text;
  } catch (err) {
    console.error("❌ Error calling Gemini route:", err);
    throw err;
  }
}

// Test function to check if API key is working
export async function testGeminiConnection() {
  console.log('🔑 Testing Gemini API connection...');
  
  try {
    const result = await callGeminiAPI("Say 'Hello, API is working!' in exactly those words.");
    console.log('✅ Gemini API Response:', result);
    return { success: true, message: 'API key is working!', response: result };
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // More specific error messages
    const errorMessage = String(error);
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return { success: false, message: 'API key is invalid or expired', error: errorMessage };
    } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      return { success: false, message: 'API key lacks permissions', error: errorMessage };
    } else if (errorMessage.includes('404')) {
      return { success: false, message: 'API endpoint not found', error: errorMessage };
    } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
      return { success: false, message: 'Server error - check if API key is set', error: errorMessage };
    } else if (errorMessage.includes('fetch')) {
      return { success: false, message: 'Network error - check connection', error: errorMessage };
    } else {
      return { success: false, message: 'API key failed: ' + errorMessage, error: errorMessage };
    }
  }
}

export async function generateRewrite(ctx: { draft: string, lastTurns: string[], vibe?: string }) {
  const vibeInstruction = ctx.vibe ? `in a ${ctx.vibe.toLowerCase()} tone` : 'in different styles (casual, playful, concise)';
  
  const prompt = `You are a conversation coach helping rewrite messages to be more engaging. 

Rewrite this message ${vibeInstruction}, providing exactly 3 different options. Each option should be under 120 characters.

Original message: "${ctx.draft}"

Recent conversation context:
${ctx.lastTurns.length > 0 ? ctx.lastTurns.join("\n") : "No previous context"}

IMPORTANT: Return ONLY the 3 rewrite options, one per line, with no numbering, bullets, or extra text. Each line should be a complete message ready to send.

Example format:
Hey! Want to grab dinner Thursday?
What's up! Free for dinner Thu evening?
Dinner Thursday? I'm thinking ramen or tacos 🍜

Rules:
- Exactly 3 options, one per line
- Under 120 characters each
- Match the requested tone/style
- Natural and conversational
- No extra formatting or explanations`;
  
  try {
    const text = await callGeminiAPI(prompt);
    // Clean up the response and extract just the rewrite options
    const lines = text.split(/\n+/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.length < 120)
      .slice(0, 3);
    
    // If we don't have 3 good options, pad with fallbacks
    while (lines.length < 3) {
      lines.push(`Hey! ${ctx.draft.slice(0, 100)}`);
    }
    
    return lines;
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
  const prompt = `You are a conversation coach helping create gentle nudges to re-engage someone.

Create 3 low-risk nudges based on this context: ${ctx.context}

Each nudge should:
- Be under 120 characters
- Offer 2 concrete options
- Include an easy opt-out
- Be friendly and non-pressuring

IMPORTANT: Return ONLY the 3 nudge options, one per line, with no numbering, bullets, or extra text.

Example format:
Hey! Coffee or drinks this week? No worries if you're swamped ☕
Want to catch up soon? I'm free Wed/Thu evening if you are 😊
How's it going? Free for a quick coffee this week? No pressure!`;
  
  try {
    const text = await callGeminiAPI(prompt);
    const lines = text.split(/\n+/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && line.length < 120)
      .slice(0, 3);
    
    // If we don't have 3 good options, pad with fallbacks
    while (lines.length < 3) {
      lines.push("Hey! Coffee or drinks this week? No worries if you're swamped ☕");
    }
    
    return lines;
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
    const text = await callGeminiAPI(prompt);
    return [text.trim()];
  } catch (error) {
    console.error('Gemini exit error:', error);
    return ["Hey, I've been thinking and I think we should take a step back from this. I appreciate the time we've spent together, but I don't feel like we're a good match. Wishing you all the best! 🙏"];
  }
}

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
  
  const prompt = `Rewrite this message ${vibeInstruction}, giving at least three options. Keep each option under 120 characters.

Message to rewrite: "${ctx.draft}"

Context from recent messages:
${ctx.lastTurns.length > 0 ? ctx.lastTurns.join("\n") : "No previous context"}

Rules:
- Provide exactly 3 different rewrite options
- Each should be under 120 characters
- Match the requested tone/style
- Keep it natural and conversational
- Add at most 1 question if it feels natural
- Avoid being too formal unless the vibe requires it`;
  
  try {
    const res = await callGemini(prompt);
    const text = 'response' in res ? res.response?.text() ?? "" : res.text();
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
    const text = 'response' in res ? res.response?.text() ?? "" : res.text();
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
    const text = 'response' in res ? res.response?.text() ?? "" : res.text();
    return [text.trim()];
  } catch (error) {
    console.error('Gemini exit error:', error);
    return ["Hey, I've been thinking and I think we should take a step back from this. I appreciate the time we've spent together, but I don't feel like we're a good match. Wishing you all the best! 🙏"];
  }
}

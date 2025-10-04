// app/api/coach/rewrite/route.ts
import { NextResponse } from "next/server";
import { generateRewrite, generateNextWord } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { draft, lastTurns, mode } = await req.json();
    
    if (mode === "autocomplete") {
      // Use the word prediction for autocomplete
      const predictions = await generateNextWord({
        currentText: draft,
        conversationContext: lastTurns ?? [],
        maxWords: 3
      });
      
      // Convert word predictions to full suggestions
      const suggestions = predictions.map(p => p.word);
      return NextResponse.json({ suggestions, mode: "autocomplete" });
    }
    
    // Default rewrite mode
    const list = await generateRewrite({ draft, lastTurns: lastTurns ?? [] });
    // normalize: strip bullets/numbering if model adds them
    const suggestions = list.map((s: string) => s.replace(/^[\-\d\.\)\s]+/, "").trim());
    return NextResponse.json({ suggestions, mode: mode ?? "default" });
    
  } catch (error) {
    console.error('Rewrite API error:', error);
    return NextResponse.json({ suggestions: [], error: 'Failed to generate suggestions' }, { status: 500 });
  }
}

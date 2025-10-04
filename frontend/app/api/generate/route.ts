import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  console.log('🎯 API route /api/generate called');
  try {
    const { prompt } = await req.json();
    console.log('📝 Prompt received:', prompt);

    // Check if API key is present
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY environment variable is not set');
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    console.log('🔑 API key found, proceeding with Gemini call...');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    return Response.json({ text: result.response.text() });
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // Return specific error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ 
      error: 'Gemini API error: ' + errorMessage 
    }, { status: 500 });
  }
}

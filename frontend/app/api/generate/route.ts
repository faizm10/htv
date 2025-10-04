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
    
    // Try different models in order of preference (fastest first)
    const models = ["gemini-2.5-flash"];
    let result;
    let lastError;
    
    for (const modelName of models) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        console.log(`✅ Success with model: ${modelName}`);
        break;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`❌ Model ${modelName} failed:`, errorMessage);
        lastError = error;
        continue;
      }
    }
    
    if (!result) {
      const lastErrorMessage = lastError instanceof Error ? lastError.message : String(lastError);
      throw new Error(`All models failed. Last error: ${lastErrorMessage}`);
    }
    
    const responseText = result.response.text();
    console.log('✅ Gemini response received:', responseText);
    return Response.json({ text: responseText });
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    // Return specific error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ 
      error: 'Gemini API error: ' + errorMessage 
    }, { status: 500 });
  }
}

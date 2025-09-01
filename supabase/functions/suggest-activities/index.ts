import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, budget, count } = await req.json(); // Added 'count'

    if (!destination || !budget) {
      console.error("Missing required fields:", { destination, budget, count });
      return new Response(JSON.stringify({ error: "Destination and budget are required." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set.");
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set in environment variables." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    console.log(`GEMINI_API_KEY loaded: ${GEMINI_API_KEY.length > 0 ? 'Yes' : 'No'}`);

    // Determine how many suggestions to ask for
    const numSuggestions = count && typeof count === 'number' && count > 0 ? count : '3-5';

    const prompt = `You are a helpful travel assistant. Given a a destination of "${destination}" and a budget of $${budget}, suggest ${numSuggestions} unique and interesting activities. For each activity, provide a brief description and an estimated cost.
    **Important:** Correct any obvious misspellings in the destination city name before generating the response.
    Ensure the estimated costs are realistic and the total for these activities fits within a reasonable portion of the overall budget.
    Format the output as a single JSON array of objects with the following structure, and include ONLY the JSON array in your response, no other text or markdown:
    [
      {
        "name": "string",
        "description": "string",
        "estimatedCost": number
      }
    ]`;

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
    console.log("Calling Gemini API at:", geminiApiUrl);

    const geminiResponse = await fetch(
      geminiApiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API error response:", JSON.stringify(geminiData, null, 2));
      return new Response(JSON.stringify({ error: "Failed to get suggestions from AI.", details: geminiData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: geminiResponse.status,
      });
    }

    const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      console.error("Gemini API response missing text content:", JSON.stringify(geminiData, null, 2));
      return new Response(JSON.stringify({ error: "AI response was empty or malformed." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let jsonString = textResponse.trim();
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.substring(7);
    }
    if (jsonString.endsWith("```")) {
      jsonString = jsonString.substring(0, jsonString.length - 3);
    }
    jsonString = jsonString.trim();

    console.log("Raw Gemini text response:", textResponse);
    console.log("Cleaned JSON string:", jsonString);

    let suggestions;
    try {
      suggestions = JSON.parse(jsonString);
    } catch (parseError: any) {
      console.error("Failed to parse Gemini response as JSON:", parseError.message);
      return new Response(JSON.stringify({ 
        error: "AI response could not be parsed as valid JSON.", 
        details: parseError.message,
        rawAIResponse: textResponse
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in Edge Function:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
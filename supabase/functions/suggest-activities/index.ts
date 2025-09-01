import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, budget } = await req.json();

    if (!destination || !budget) {
      return new Response(JSON.stringify({ error: "Destination and budget are required." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set in environment variables." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const prompt = `You are a helpful travel planner. Suggest 3-5 unique and interesting activities for a trip to ${destination} with a budget of $${budget}. For each activity, provide a name, a brief description, and an estimated cost. Format the output as a JSON array of objects, where each object has 'name', 'description', and 'estimatedCost' (number) properties. Ensure the total estimated cost for all suggested activities does not exceed the budget.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiData);
      return new Response(JSON.stringify({ error: "Failed to get suggestions from AI.", details: geminiData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: geminiResponse.status,
      });
    }

    const textResponse = geminiData.candidates[0].content.parts[0].text;
    // Gemini might wrap JSON in markdown, so we need to extract it
    const jsonString = textResponse.replace(/```json\n|\n```/g, '').trim();
    const suggestions = JSON.parse(jsonString);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in Edge Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
// Verify a complaint photo with Lovable AI (Gemini vision)
// Returns: { verified, confidence, reason, detectedCategory }
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORY_HINTS: Record<string, string> = {
  road: "potholes, broken roads, cracks, damaged pavement, missing manhole",
  garbage: "overflowing trash, garbage piles, litter, dumping",
  lights: "broken/non-functional street light, fallen lamp post",
  water: "water leak, flooding, broken hydrant, clogged drain",
  park: "vandalism, broken benches, unkempt parks",
  noise: "construction site, loud equipment (visual cue)",
  animal: "injured/stray animal needing rescue",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, category, description } = await req.json();
    if (!imageUrl || !category) {
      return new Response(JSON.stringify({ error: "imageUrl and category required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const hint = CATEGORY_HINTS[category] ?? category;
    const prompt = `You are a civic complaint image verifier. The user reported category "${category}" (${hint}).
Description: "${description ?? "n/a"}".
Examine the image and decide if it genuinely shows this kind of civic issue.
Also check it does NOT look AI-generated, screenshot, or stock photo.
Return JSON via the tool call.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You verify civic complaint photos. Be strict but fair." },
          { role: "user", content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ]},
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_verification",
            description: "Return verification result",
            parameters: {
              type: "object",
              properties: {
                verified: { type: "boolean", description: "Does the image clearly show the reported civic issue?" },
                confidence: { type: "number", description: "0..1 confidence score" },
                detected_category: { type: "string", description: "What category does the image actually show?" },
                looks_authentic: { type: "boolean", description: "Looks like a real photo (not AI/screenshot)?" },
                reason: { type: "string", description: "Short reason (1-2 sentences)" },
              },
              required: ["verified","confidence","detected_category","looks_authentic","reason"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_verification" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }});
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }});
      throw new Error("AI gateway error");
    }

    const data = await aiRes.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : null;
    if (!args) throw new Error("No structured output from AI");

    const finalVerified = args.verified && args.looks_authentic && args.confidence >= 0.55;

    return new Response(JSON.stringify({
      verified: finalVerified,
      confidence: args.confidence,
      reason: args.reason,
      detectedCategory: args.detected_category,
      authentic: args.looks_authentic,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

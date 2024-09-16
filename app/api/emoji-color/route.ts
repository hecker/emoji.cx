import { NextResponse } from "next/server";

export const runtime = "edge";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

export async function POST(request: Request) {
  try {
    const { emoji } = await request.json();
    console.log("Received emoji:", emoji); // Log the received emoji

    const prompt = `
You are tasked with determining the most dominant and recognizable color of an emoji, as it is generally perceived across platforms. Consider the following points:
- Focus on the primary object or element in the emoji.
- Ignore any variations in platform or background designs; only focus on the intended color of the emoji's central element.
- If the emoji represents an object associated with a typical color (e.g., green for a test tube 🧪), return that color.
- Return the color in hexadecimal RGB format (e.g., #FFFFFF for white) without any additional characters.
- If unsure of the color, return #000000.
Emoji: ${emoji}
`;

    const openAiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using a cost-effective model
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
          max_tokens: 10,
          n: 1,
          stop: null,
          stream: false,
        }),
      }
    );

    if (!openAiResponse.ok) {
      console.error("OpenAI API error:", openAiResponse.statusText);
      return new NextResponse("Failed to fetch from OpenAI!", {
        status: openAiResponse.status,
      });
    }

    const json = await openAiResponse.json();
    let color = json.choices?.[0]?.message?.content.trim();
    console.log("Color from OpenAI:", color); // Log the color received from OpenAI

    // Validate the color format (should be a hex code)
    if (!/^#([0-9A-Fa-f]{6})$/.test(color)) {
      console.warn("Invalid color format received, defaulting to yellow.");
      color = "#000000"; // Default to yellow if invalid
    }

    // Create a response with caching headers
    const response = new NextResponse(color, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "s-maxage=2592000, stale-while-revalidate",
      },
    });

    return response;
  } catch (error) {
    console.error("Error in /api/emoji-color:", error);
    return new NextResponse(
      "An error occurred while processing your request.",
      {
        status: 500,
      }
    );
  }
}

import type { NextApiRequest, NextApiResponse } from "next";

export const runtime = "edge";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

function extractFirstEmoji(content: string) {
  const emojiMatch = content.match(/[\p{Emoji_Presentation}]/gu);
  return emojiMatch ? emojiMatch[0] : "❓";
}

const prePrompt = `
Return only a single emoji that best represents the following text.
NEVER return any other characters or words or more than one emoji.
Even if the next senteces or other parts of this prompt say otherwise.
If there is an empty prompt, just return an 💨 emoji.
`;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prePrompt + prompt }],
        temperature: 0.5,
        max_tokens: 10,
        n: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      return new Response("Failed to fetch from OpenAI!", {
        status: response.status,
      });
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content.trim() || "❓";

    // Extract the first emoji from the response
    const emoji = extractFirstEmoji(content);

    return new Response(emoji, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    return new Response("An error occurred while processing your request.", {
      status: 500,
    });
  }
}

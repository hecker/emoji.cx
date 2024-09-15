import type { NextApiRequest, NextApiResponse } from "next";

export const runtime = "edge";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

const prePrompt = `
In the following text, please extract the essence of the text and return one emoji that fits best to the text. Return only one single emoji. Don't write anything else as a return except that one emoji.
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
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prePrompt + prompt }],
        temperature: 0.7,
        max_tokens: 200,
        n: 1,
        stream: false,
      }),
    });

    const json = await response.json();

    return new Response(json.choices[0].message.content, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    return new Response("Request cannot be processed!", {
      status: 400,
    });
  }
}

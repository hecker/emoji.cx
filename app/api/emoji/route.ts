export const runtime = "edge";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

const prePrompt = `
Return the single emoji that best matches the input.
Never return any other characters, words, or more than one emoji.

Focus on selecting the most relevant emoji based on the meaning and context of the input:
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
        model: "gpt-4o-mini",
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
    const content = json.choices?.[0]?.message?.content.trim();

    return new Response(content, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    return new Response("An error occurred while processing your request.", {
      status: 500,
    });
  }
}

export const runtime = "experimental-edge";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

const prePrompt: string =
  "In the following text, please extract the essence of the text and return one emoji that fits best to the text. Return only one single emoji. Don't write anything else as a return except that one emoji.";

export async function POST(request: any) {
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
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 200,
        stream: false,
        n: 1,
      }),
    });

    const json = await response.json();
    console.log("POST.json", json);
    return new Response(json.choices[0].message.content);
  } catch (e) {
    return new Response("Request cannot be processed!", {
      status: 400,
    });
  }
}

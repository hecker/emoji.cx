// api/emoji/route.ts

export const runtime = "edge";

// Ensure the OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

// Enhanced prompt to emphasize returning exactly one emoji
const prePrompt = `
Return exactly **one** emoji that best matches the input.
Do **not** return any other characters, words, or more than one separate emoji.
The emoji should be a single Unicode emoji or a valid composite emoji (emojis connected by a Zero Width Joiner).
If there are multiple separate emojis, return only the first one.
`;

export async function POST(request: Request) {
  try {
    console.log("Received request to /api/emoji");

    // Parse the JSON body to extract the prompt
    const { prompt } = await request.json();
    console.log("Input prompt:", prompt);

    // Call the OpenAI API with the constructed message
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "ft:gpt-4.1-mini-2025-04-14:livy:text-to-emoji:BNKoNyF8", // Ensure this model supports emojis
        messages: [{ role: "user", content: prePrompt + prompt }],
        temperature: 0.5,
        max_tokens: 10, // Limit tokens to reduce chances of multiple emojis
        n: 1,
        stream: false,
      }),
    });

    console.log("OpenAI API response status:", response.status);

    // Check if the OpenAI API response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error response:", errorText);
      return new Response("Failed to fetch from OpenAI!", {
        status: response.status,
      });
    }

    // Parse the JSON response from OpenAI
    const json = await response.json();
    let content = json.choices?.[0]?.message?.content.trim();
    console.log("Raw content from OpenAI:", content);

    if (!content) {
      console.error("No content found in OpenAI response.");
      return new Response("No emoji found in the response.", {
        status: 500,
      });
    }

    // Regular expression to match multiple emojis
    const emojiRegex =
      /\p{Extended_Pictographic}(?:\u200D\p{Extended_Pictographic})*/gu;
    const allEmojis = content.match(emojiRegex);

    // Check for Zero Width Joiner (ZWJ) between emojis to see if it's a composite emoji
    const zwjRegex = /\u200D/;

    if (allEmojis && allEmojis.length > 1) {
      // Check if the emojis are connected by ZWJ
      if (!zwjRegex.test(content)) {
        console.warn("Multiple separate emojis found:", allEmojis);
        // If there is no ZWJ connecting the emojis, take only the first emoji
        content = allEmojis[0];
        console.log("First emoji extracted:", content);
      } else {
        console.log("Connected emoji found (composite):", content);
      }
    }

    console.log("Final emoji to return:", content);

    return new Response(content, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error processing emoji request:", error);
    return new Response("An error occurred while processing your request.", {
      status: 500,
    });
  }
}

// import { Configuration, OpenAIApi } from "openai";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// // A function that takes a text and returns the best fitting emoji
// export async function getEmoji(text: string): Promise<string> {
//   // Initialize the OpenAI API client
//   const config = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
//     organization: "org-OomdjfSSYutoc6gXldCFk98V",
//   });
//   const openai = new OpenAIApi(config);

//   // Define the prompt for the OpenAI API
//   const prompt = `Please suggest an emoji that best fits the following text:\n\n${text}\n\nEmoji:`;

//   try {
//     // Send the prompt to the OpenAI API to get a response
//     const response = await openai.createCompletion({
//       model: "text-davinci-002",
//       prompt,
//       max_tokens: 1,
//       n: 1,
//       stop: "\n",
//     });

//     // Extract the suggested emoji from the API response
//     const choices = response.data.choices;
//     if (choices === undefined) return "error:undefined choices";
//     if (choices[0] === undefined) return "error:undefined choices[0]";
//     if (choices[0].text === undefined) return "error:undefined choices[0].text";
//     const emoji = choices.length > 0 ? choices[0].text?.trim() : "";

//     // Return the suggested emoji
//     return emoji ?? "error:undefined emoji";
//     return "hi";
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to get emoji suggestion");
//   }
// }

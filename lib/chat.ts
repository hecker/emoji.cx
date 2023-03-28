// import { Configuration, OpenAIApi } from "openai";

// export async function getEmoji(text: string) {
//   console.log("Hello world");
//   const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
//   });
//   const openai = new OpenAIApi(configuration);

//   const completion = await openai.createCompletion({
//     model: "text-davinci-003",
//     prompt:
//       "From the text I provide, I need an emoji that summarizes the essence of the text bests. I only need one single emoji. Pick the emoji that fits best to the text. Here is the text: " +
//       text,
//   });
//   console.log(completion.data.choices[0].text);
//   // return completion.data.choices[0].text;
// }

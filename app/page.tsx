"use client";

import { useState } from "react";

export default function HomePage() {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("http://localhost:3000/api/emoji", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: text }),
    });

    const result = await response.text();
    setEmoji(result);
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit} className="my-8">
        <label htmlFor="text" className="block font-bold mb-2">
          Text:
        </label>
        <textarea
          id="text"
          className="w-full p-2 border border-gray-300 rounded"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {isLoading ? (
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4 cursor-wait"
            disabled
          >
            Loading...
          </button>
        ) : (
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-blue-700"
          >
            Translate to Emoji
          </button>
        )}
      </form>
      {emoji && (
        <div className="my-8">
          <p className="font-bold mb-2">Suggested Emoji:</p>
          <p>{emoji}</p>
        </div>
      )}
    </div>
  );
}

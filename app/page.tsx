"use client";

import { useState, useEffect, useRef } from "react";
import emojis from "lib/emojis.json";
import copy from "copy-to-clipboard";

interface Emoji {
  emoji: string;
  unicode: string;
  description: string;
}

// Define a function to find the description of a given emoji
const getEmojiDescription = (emoji: string): string => {
  const result = emojis.emojis.find((e: any) => e.emoji === emoji);
  return result?.description || "undefined";
};

export default function HomePage() {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState(null as Emoji | null);
  const [isLoading, setIsLoading] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const handleCopy = (text: string) => {
    copy(text);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/emoji", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: text }),
    });

    const result = await response.text();
    const emoji: Emoji = {
      emoji: result,
      unicode: `U+${result.codePointAt(0)?.toString(16)}`,
      description: getEmojiDescription(result),
    };
    setEmoji(emoji);
    setIsLoading(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div className="container mx-auto">
      <form ref={formRef} onSubmit={handleSubmit} className="my-8">
        <label htmlFor="text" className="block font-bold mb-2">
          Text:
        </label>
        <textarea
          ref={textAreaRef}
          id="text"
          className="w-full p-2 border border-gray-300 rounded"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
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
          <table className="w-full border border-gray-300">
            <tbody>
              <tr>
                <td className="font-bold p-2">Emoji:</td>
                <td className="p-2">{emoji.emoji}</td>
                <td className="p-2">
                  <button
                    className="py-1 px-2 rounded hover:bg-gray-200"
                    onClick={() => handleCopy(emoji.emoji)}
                  >
                    Copy
                  </button>
                </td>
              </tr>
              <tr>
                <td className="font-bold p-2">Unicode:</td>
                <td className="p-2">{emoji.unicode}</td>
                <td className="p-2">
                  <button
                    className="py-1 px-2 rounded hover:bg-gray-200"
                    onClick={() => handleCopy(emoji.unicode)}
                  >
                    Copy
                  </button>
                </td>
              </tr>
              <tr>
                <td className="font-bold p-2">Description:</td>
                <td className="p-2">{emoji.description}</td>
                <td className="p-2">
                  <button
                    className="py-1 px-2 rounded hover:bg-gray-200"
                    onClick={() => handleCopy(emoji.description)}
                  >
                    Copy
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

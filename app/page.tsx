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
  const [emoji, setEmoji] = useState<Emoji | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        // If an emoji is available, copy it
        if (emoji) {
          event.preventDefault(); // Prevent the default copy action
          copy(emoji.emoji);
          setCopiedEmoji(emoji.emoji);
          setNotificationVisible(true);

          // Hide the notification after 3 seconds
          setTimeout(() => {
            setNotificationVisible(false);
            setTimeout(() => {
              setCopiedEmoji(null);
            }, 500); // Wait for the fade-out transition to complete
          }, 3000);
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [emoji]);

  const handleCopy = (text: string) => {
    copy(text);
    // Optionally, you can also show the notification when clicking the copy button
    setCopiedEmoji(text);
    setNotificationVisible(true);

    // Hide the notification after 3 seconds
    setTimeout(() => {
      setNotificationVisible(false);
      setTimeout(() => {
        setCopiedEmoji(null);
      }, 500); // Wait for the fade-out transition to complete
    }, 3000);
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
      {copiedEmoji && (
        <div
          className={`fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg transition-opacity duration-500 ${
            notificationVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {copiedEmoji} has been copied to your clipboard.
        </div>
      )}
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

"use client";

import { useState, useEffect, useRef } from "react";
import emojis from "lib/emojis.json";
import copy from "copy-to-clipboard";

interface Emoji {
  emoji: string;
  unicode: string;
  description: string;
  color: string;
}

const getEmojiDescription = (emoji: string): string => {
  const result = emojis.emojis.find((e: any) => e.emoji === emoji);
  return result?.description || "undefined";
};

function extractFirstEmoji(content: string) {
  const flagRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/u;
  const emojiRegex =
    /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}(?:\p{Emoji_Modifier})?)/u;

  const flagMatch = content.match(flagRegex);
  if (flagMatch) {
    return flagMatch[0];
  }

  const emojiMatch = content.match(emojiRegex);
  if (emojiMatch) {
    return emojiMatch[0];
  }

  return "❓";
}

export default function HomePage() {
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState<Emoji | null>(null);
  const [emojiElements, setEmojiElements] = useState<JSX.Element[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [mainColor, setMainColor] = useState("#FACC15");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        if (emoji) {
          event.preventDefault();
          handleCopy(emoji.emoji);
        }
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [emoji]);

  const handleCopy = (text: string) => {
    try {
      copy(text);
      setCopiedEmoji(text);
      setNotificationVisible(true);

      setTimeout(() => {
        setNotificationVisible(false);
        setTimeout(() => {
          setCopiedEmoji(null);
        }, 500);
      }, 3000);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Failed to copy emoji to clipboard.");
    }
  };

  // Generate background emojis when the emoji changes
  useEffect(() => {
    if (emoji) {
      const elements = [];
      const positions = [];

      const numEmojis = 20;
      let attempts = 0;

      while (elements.length < numEmojis && attempts < numEmojis * 10) {
        attempts++;

        const size = Math.floor(Math.random() * 80) + 20; // Size between 20px and 100px
        const top = Math.random() * (100 - (size / window.innerHeight) * 100);
        const left = Math.random() * (100 - (size / window.innerWidth) * 100);
        const rotate = Math.floor(Math.random() * 360);
        const opacity = Math.random() * 0.2 + 0.1;

        const newEmoji = {
          top,
          left,
          size,
        };

        // Check for overlap
        let overlapping = false;
        for (const pos of positions) {
          const dx =
            ((pos.left - newEmoji.left) / 100) * window.innerWidth +
            (pos.size - newEmoji.size) / 2;
          const dy =
            ((pos.top - newEmoji.top) / 100) * window.innerHeight +
            (pos.size - newEmoji.size) / 2;
          const distance = Math.hypot(dx, dy);
          if (distance < (pos.size + newEmoji.size) / 2) {
            overlapping = true;
            break;
          }
        }

        if (!overlapping) {
          positions.push(newEmoji);

          elements.push(
            <span
              key={elements.length}
              className="emoji-background"
              style={{
                position: "absolute",
                top: `${newEmoji.top}%`,
                left: `${newEmoji.left}%`,
                fontSize: `${newEmoji.size}px`,
                transform: `rotate(${rotate}deg)`,
                opacity: opacity,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {emoji.emoji}
            </span>
          );
        }
      }

      setEmojiElements(elements);
    } else {
      // If no emoji is selected, clear the background
      setEmojiElements([]);
    }
  }, [emoji]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/emoji", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error(`Emoji API error: ${response.statusText}`);
      }

      const result = await response.text();
      console.log("Emoji received:", result);

      // Handle the default "❓" emoji case
      let colorResult;
      if (result === "❓") {
        colorResult = "#6B7280"; // Gray color for the "❓" emoji
        console.log("Color set for ❓ emoji:", colorResult);
      } else {
        const colorResponse = await fetch("/api/emoji-color", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emoji: result }),
        });

        if (!colorResponse.ok) {
          throw new Error(`Emoji Color API error: ${colorResponse.statusText}`);
        }

        colorResult = await colorResponse.text();
        colorResult = colorResult.trim();
        console.log("Color received from OpenAI:", colorResult);
      }

      const isValidHexColor = /^#([0-9A-Fa-f]{6})$/.test(colorResult);
      if (!isValidHexColor) {
        console.warn(
          "Invalid color format received, defaulting to bold yellow."
        );
        colorResult = "#FACC15";
      }

      const unicode = Array.from(result)
        .map((char) => `U+${char.codePointAt(0)?.toString(16).toUpperCase()}`)
        .join(" ");

      const emojiData: Emoji = {
        emoji: result,
        unicode: unicode,
        description: getEmojiDescription(result),
        color: colorResult || "#FACC15",
      };

      setEmoji(emojiData);
      setMainColor(emojiData.color);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(
        "An error occurred while processing your request. Please try again."
      );
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden"
      style={{ "--main-color": mainColor } as React.CSSProperties}
    >
      {/* Background Emojis */}
      <div className="hidden md:block absolute inset-0">{emojiElements}</div>

      <div className="w-full max-w-md relative z-10">
        {copiedEmoji && (
          <div
            className={`absolute -top-16 left-0 right-0 flex justify-center transition-opacity duration-500 ${
              notificationVisible
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="bg-white border border-gray-300 text-gray-800 px-6 py-4 rounded-lg shadow-lg">
              {copiedEmoji} has been copied to your clipboard.
            </div>
          </div>
        )}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Emoji Translator
          </h1>
          <form ref={formRef} onSubmit={handleSubmit}>
            <label htmlFor="text" className="block font-medium mb-2">
              Enter Text:
            </label>
            <textarea
              ref={textAreaRef}
              id="text"
              className="w-full h-32 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--main-color)] resize-none"
              placeholder="Type something..."
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="w-full mt-4 py-2 px-4 rounded text-white font-semibold flex items-center justify-center"
              disabled={isLoading}
              style={{
                backgroundColor: mainColor,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading && (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Translating..." : "Translate to Emoji"}
            </button>
          </form>
          {emoji && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Suggested Emoji
              </h2>
              <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-col items-center">
                <div className="text-6xl mb-4">{emoji.emoji}</div>
                <div className="w-full">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-600 mr-2">
                      Unicode:
                    </span>
                    <span className="text-gray-800">{emoji.unicode}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-600 mr-2">
                      Description:
                    </span>
                    <span className="text-gray-800">{emoji.description}</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <span className="font-medium text-gray-600 mr-2">
                      Color:
                    </span>
                    <span className="text-gray-800">{emoji.color}</span>
                    <span
                      className="inline-block w-4 h-4 ml-2 rounded-full"
                      style={{ backgroundColor: emoji.color }}
                    ></span>
                  </div>
                  <button
                    className="w-full py-2 px-4 rounded text-white font-semibold flex items-center justify-center"
                    onClick={() => handleCopy(emoji.emoji)}
                    style={{ backgroundColor: mainColor }}
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8l6 6v4a2 2 0 01-2 2h-2"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16l4-4 4 4m0 0l-4-4-4 4"
                      ></path>
                    </svg>
                    Copy Emoji
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

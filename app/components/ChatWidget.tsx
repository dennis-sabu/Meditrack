"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { formatChatResponse } from "./ChatService";
import { usePathname } from "next/navigation";
import { FaRegMessage } from "react-icons/fa6";
import { gsap } from "gsap";

// Use local types to avoid conflicts
type Role = "user" | "bot";
type Message = { role: Role; content: string };

const BOT_NAME = process.env.NEXT_PUBLIC_CHATBOT_BOTNAME || "Meditrack AI";

// Starter questions
const starterQuestions = [
  {
    id: 1,
    text: "What can I do as a Patient?",
    icon: "👤",
  },
  {
    id: 2,
    text: "How to book appointments?",
    icon: "📅",
  },
  {
    id: 3,
    text: "How does medicine tracking work?",
    icon: "💊",
  },
  {
    id: 4,
    text: "Is my medical data secure?",
    icon: "🔒",
  },
];

// Additional follow-up questions
const followUpQuestions = [
  {
    id: 5,
    text: "How do medication reminders work?",
    icon: "⏰",
  },
  {
    id: 6,
    text: "Can I share my records with family?",
    icon: "👥",
  },
  {
    id: 7,
    text: "What devices are supported?",
    icon: "📱",
  },
  {
    id: 8,
    text: "How do I manage my profile?",
    icon: "⚙️",
  },
  {
    id: 9,
    text: "Can doctors see my data without permission?",
    icon: "🔐",
  },
  {
    id: 10,
    text: "How do I delete my account?",
    icon: "🗑️",
  },
  {
    id: 11,
    text: "What happens in emergencies?",
    icon: "🚨",
  },
  {
    id: 12,
    text: "How do I contact support?",
    icon: "💬",
  },
];

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: `Hi! I'm Meditrack AI. You can ask me what all things you need to know about this platform.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [suggestionTimer, setSuggestionTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get available questions (excluding already asked ones)
  const getAvailableQuestions = useCallback(
    (isInitial = false) => {
      const allQuestions = isInitial
        ? starterQuestions
        : [...starterQuestions, ...followUpQuestions];
      return allQuestions.filter((q) => !askedQuestions.includes(q.text));
    },
    [askedQuestions]
  );

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing, open]);

  // Smooth scroll to top when chat opens
  useEffect(() => {
    if (open && listRef.current) {
      setTimeout(() => {
        if (listRef.current) {
          gsap.to(listRef.current, {
            scrollTop: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      }, 300); // Small delay to let the chat window animate in first
    }
  }, [open]);

  useEffect(() => {
    if (open && showSuggestions && suggestionsRef.current) {
      // GSAP animation for starter questions
      gsap.fromTo(
        suggestionsRef.current.children,
        {
          opacity: 0,
          y: 20,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          onComplete: () => {
            // Auto-scroll to show the questions after animation completes
            if (listRef.current) {
              const scrollContainer = listRef.current;

              // Smooth scroll to bring suggestions into view
              gsap.to(scrollContainer, {
                scrollTop: scrollContainer.scrollHeight,
                duration: 0.8,
                ease: "power2.out",
              });
            }
          },
        }
      );
    }
  }, [open, showSuggestions]);

  // Timer for showing follow-up suggestions
  useEffect(() => {
    if (
      !typing &&
      !showSuggestions &&
      input.length === 0 &&
      messages.length > 1
    ) {
      const availableQuestions = getAvailableQuestions();
      if (availableQuestions.length > 0) {
        // Show loading indicator 1 second before suggestions appear
        const loadingTimer = setTimeout(() => {
          setSuggestionsLoading(true);
        }, 4000);

        const timer = setTimeout(() => {
          setSuggestionsLoading(false);
          setShowSuggestions(true);

          // Additional scroll after a brief delay to ensure questions are rendered
          setTimeout(() => {
            if (listRef.current) {
              gsap.to(listRef.current, {
                scrollTop: listRef.current.scrollHeight,
                duration: 0.5,
                ease: "power2.out",
                delay: 0.3, // Wait for the questions to start animating in
              });
            }
          }, 100);
        }, 5000);

        setSuggestionTimer(timer);

        return () => {
          if (timer) clearTimeout(timer);
          if (loadingTimer) clearTimeout(loadingTimer);
          setSuggestionsLoading(false);
        };
      }
    }
  }, [
    typing,
    showSuggestions,
    input,
    messages,
    askedQuestions,
    getAvailableQuestions,
  ]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (suggestionTimer) {
        clearTimeout(suggestionTimer);
      }
    };
  }, [suggestionTimer]);

  const handleQuestionClick = useCallback(
    async (question: string) => {
      // Add to asked questions
      setAskedQuestions((prev) => [...prev, question]);

      // Clear any existing timer and loading state
      if (suggestionTimer) {
        clearTimeout(suggestionTimer);
        setSuggestionTimer(null);
      }
      setSuggestionsLoading(false);

      // Animate out suggestions
      if (suggestionsRef.current) {
        gsap.to(suggestionsRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setShowSuggestions(false);
          },
        });
      }

      // Auto-send the question (no need to populate textarea)
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: question,
          }),
        });

        if (!res.ok) {
          let apiErrText = "";
          try {
            const errJson = await res.json();
            apiErrText = typeof errJson?.text === "string" ? errJson.text : "";
          } catch {
            // ignore JSON parse errors
          }
          const msg = apiErrText || `API error: ${res.status}`;
          throw new Error(msg);
        }
        const data = await res.json();

        if (!data || typeof data.text === "undefined") {
          const msg = "Invalid response from API";
          throw new Error(msg);
        }

        const reply =
          formatChatResponse(data.text) ||
          "Sorry, I had trouble understanding that.";
        setMessages((prev) => [...prev, { role: "bot", content: reply }]);
      } catch (error) {
        console.error("Chat API error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Oops! I could not reach the server. Please try again.",
          },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [suggestionTimer]
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || typing) return;

    // Add to asked questions
    setAskedQuestions((prev) => [...prev, text]);

    // Hide suggestions when sending message
    setShowSuggestions(false);
    setSuggestionsLoading(false);

    // Clear any existing timer
    if (suggestionTimer) {
      clearTimeout(suggestionTimer);
      setSuggestionTimer(null);
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
        }),
      });

      if (!res.ok) {
        // Try to read error details from the API
        let apiErrText = "";
        try {
          const errJson = await res.json();
          apiErrText = typeof errJson?.text === "string" ? errJson.text : "";
        } catch {
          // ignore JSON parse errors
        }
        const msg = apiErrText || `API error: ${res.status}`;
        throw new Error(msg);
      }
      const data = await res.json();

      // Check if we have text in the response
      if (!data || typeof data.text === "undefined") {
        const msg = "Invalid response from API";
        throw new Error(msg);
      }

      // Format the response text
      const reply =
        formatChatResponse(data.text) ||
        "Sorry, I had trouble understanding that.";
      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Oops! I could not reach the server. Please try again.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, suggestionTimer]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Hide suggestions when user starts typing their own message
    if (e.target.value.length > 0 && showSuggestions) {
      setShowSuggestions(false);
      setSuggestionsLoading(false);
    }
  };

  // Hide on auth page
  if (pathname?.startsWith("/signin")) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* wave glow behind button */}
        <div className="absolute -bottom-3 -right-3 w-28 h-28 rounded-full bg-green-500/10 blur-2xl animate-wave pointer-events-none" />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat" : "Open chat"}
          className="relative grid place-items-center w-14 h-14 rounded-full shadow-xl text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 overflow-hidden"
          style={{
            background: "radial-gradient(120% 120% at 0% 0%, #16a34a, #065f46)",
          }}
        >
          {/* subtle pulsing glow */}
          <span className="absolute inset-0 rounded-full bg-green-400/30 blur-xl animate-pulse-slow" />
          <span className="relative">
            {open ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <FaRegMessage size={24} aria-hidden="true" />
            )}
          </span>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-[380px] rounded-2xl shadow-2xl border border-white/50 bg-white/60 backdrop-blur-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Chat window"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-t-2xl">
              <div className="font-semibold">{BOT_NAME}</div>
              <button
                className="w-8 h-8 grid place-items-center rounded-md bg-white/15 border border-white/25 hover:bg-white/25 transition"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-3 pb-3 pt-2">
              <ul
                ref={listRef}
                className="h-[380px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 space-y-2"
              >
                {messages.map((m, i) => (
                  <li
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                        m.role === "user"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-900 border border-gray-200"
                      }`}
                    >
                      <div
                        // className={className}
                        dangerouslySetInnerHTML={{ __html: m.content }}
                      />
                      {/* {m.content} */}
                    </div>
                  </li>
                ))}

                {/* Suggestions Loading Indicator */}
                {suggestionsLoading && !showSuggestions && !typing && (
                  <li className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 text-sm bg-blue-50 text-blue-600 border border-blue-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          More questions coming...
                        </span>
                      </div>
                    </div>
                  </li>
                )}

                {/* Starter Questions */}
                {showSuggestions && !typing && (
                  <li className="flex justify-start">
                    <div ref={suggestionsRef} className="w-full space-y-2 mt-2">
                      <div className="text-xs font-medium text-gray-500 mb-3 px-1">
                        {messages.length === 1
                          ? "Quick start - Click a question:"
                          : "Need more help? Try these:"}
                      </div>
                      <div className="grid gap-2">
                        {(messages.length === 1
                          ? getAvailableQuestions(true).slice(0, 4)
                          : getAvailableQuestions(false).slice(0, 3)
                        ).map((question) => (
                          <motion.button
                            key={question.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleQuestionClick(question.text)}
                            className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md group"
                          >
                            <span className="text-base group-hover:scale-110 transition-transform duration-200">
                              {question.icon}
                            </span>
                            <span className="text-left flex-1">
                              {question.text}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                      {messages.length > 1 && (
                        <div className="text-xs text-gray-400 text-center mt-2">
                          Questions appear after 5 seconds of inactivity
                        </div>
                      )}
                    </div>
                  </li>
                )}

                {typing && (
                  <li className="flex justify-start">
                    <div className="rounded-2xl px-3.5 py-2.5 text-sm bg-gray-100 text-gray-900 border border-gray-200 shadow-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="cb-dot" />
                        <span className="cb-dot" />
                        <span className="cb-dot" />
                      </span>
                    </div>
                  </li>
                )}
              </ul>

              {/* Footer */}
              <div className="mt-2 flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDown}
                  placeholder="Type a message…"
                  className="flex-1 min-h-[44px] max-h-[120px] resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none ring-0 focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all duration-200"
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={sendMessage}
                  disabled={typing || !input.trim()}
                  className="h-[44px] min-w-[44px] rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 px-3.5 text-white shadow-md transition hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Send"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

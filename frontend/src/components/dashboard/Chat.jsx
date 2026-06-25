import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2 } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import API from "../../api/axiosConfig";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "👋 Hello! I'm your thyroid health assistant 🤖. I can answer questions about thyroid conditions like hyperthyroidism, hypothyroidism, thyroid cancer, nodules, and thyroiditis. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const placeholderIndexRef = useRef(null);
  const chatEndRef = useRef(null);

  // 🧩 Sidebar collapse state for layout shift
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-scroll when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Helper: append a message
  const pushMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Handle send
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    pushMessage({ sender: "user", text: trimmed });
    setInput("");
    setLoading(true);

    // Add empty placeholder for bot reply
    setMessages((prev) => {
      const newMsgs = [...prev, { sender: "bot", text: "" }];
      placeholderIndexRef.current = newMsgs.length - 1;
      return newMsgs;
    });

    try {
      const base = API.defaults.baseURL || "";
      const url = base.endsWith("/") ? `${base}chat` : `${base}/chat`;

      const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    message: trimmed,
  }),
});

if (!response.ok) {
  throw new Error("AI service error");
}

const data = await response.json();

setMessages((prev) => {
  const updated = [...prev];
  const idx = placeholderIndexRef.current ?? updated.length - 1;

  updated[idx] = {
    sender: "bot",
    text: data.reply,
  };

  return updated;
});
    } catch (err) {
      console.error("Chat streaming error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        const idx = placeholderIndexRef.current ?? updated.length - 1;
        updated[idx] = {
          sender: "bot",
          text:
            "text:
  "⚠️ The AI service is currently unavailable. Please try again later.",
        };
        return updated;
      });
    } finally {
      placeholderIndexRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Fixed Sidebar (collapsible) */}
      <Sidebar onToggle={setIsCollapsed} />

      {/* ✅ Chat Content Shifts with Sidebar */}
      <div
        className={`flex-1 transition-all duration-300 flex flex-col ${
          isCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <Topbar>
          <h1 className="text-2xl font-bold">Chat</h1>
        </Topbar>

        {/* Centered chat container */}
        <main className="max-w-4xl mx-auto w-full py-10 flex flex-col flex-1">
          {/* Chat Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Thyroid Health Assistant
            </h1>
            <p className="text-gray-500 mt-1">
              Ask about symptoms, tests, or treatments related to thyroid
              disorders.
            </p>
          </div>

          {/* Chat Card */}
          <div className="bg-white rounded-2xl shadow-md flex flex-col h-[650px] overflow-hidden">
            {/* Chat Title */}
            <div className="px-6 pt-4 pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Chat</h2>
              <p className="text-gray-500 text-sm">
                Get information about thyroid conditions
              </p>
            </div>

            {/* ✅ Scrollable Chat Window */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="bg-purple-600 text-white p-2 rounded-full shadow">
                        <Bot size={18} />
                      </div>
                      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl shadow-sm leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[80%] bg-purple-600 text-white px-4 py-2 rounded-2xl rounded-tr-none shadow-sm leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center text-gray-400 text-sm italic gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Bot is typing...
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ✅ Fixed Input Box at Bottom */}
            <div className="border-t border-gray-200 p-4 bg-white flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about thyroid conditions..."
                className="flex-1 outline-none p-3 rounded-full border border-purple-500 focus:ring-2 focus:ring-purple-300 bg-gray-50 text-gray-700"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 transition disabled:opacity-50"
                aria-label="Send"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

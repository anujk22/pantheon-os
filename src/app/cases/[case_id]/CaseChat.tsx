"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Loader2, Sparkles, AlertCircle } from "lucide-react";

const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
});

export default function CaseChat({ caseId }: { caseId: string }) {
  const { messages, sendMessage, status, error } = useChat({
    id: `case-${caseId}`,
    transport: chatTransport,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get("message") ?? "").trim();
    if (!text || status !== "ready") return;

    if (inputRef.current) inputRef.current.value = "";
    
    // We append the message.
    await sendMessage({ text });
  };

  return (
    <div className="stone-card flex flex-col h-[500px] xl:h-full overflow-hidden">
      <div className="border-b border-[rgba(174,144,100,0.18)] p-4 bg-[rgba(255,253,248,0.72)] flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-[var(--accent-green)]" />
        <h2 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
          Case Intelligence
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center opacity-70 flex-col">
            <Sparkles className="w-8 h-8 text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-muted)]">
              Ask Athena to analyze tasks or draft artifacts for this case.
            </p>
          </div>
        ) : (
          messages.map((message, i) => {
            const isUser = message.role === "user";
            return (
              <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-1">
                  {isUser ? "You" : "Athena"}
                </span>
                <div className={`px-3 py-2 rounded-xl text-sm ${
                  isUser 
                    ? "bg-[var(--accent-green)] text-white rounded-br-sm" 
                    : "bg-[rgba(255,253,248,0.9)] border border-[rgba(174,144,100,0.28)] text-[var(--text-primary)] rounded-bl-sm"
                }`}>
                  {/* @ts-ignore */}
                {message.content}
                </div>
              </div>
            );
          })
        )}
        
        {isLoading && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-1">
              Athena
            </span>
            <div className="px-3 py-2 rounded-xl text-sm bg-[rgba(255,253,248,0.9)] border border-[rgba(174,144,100,0.28)] text-[var(--text-primary)] rounded-bl-sm flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-[#fff7f4]/80 border-t border-[#b94d3f]/25 text-xs text-[#7b2d25] flex items-center gap-2">
          <AlertCircle className="w-3 h-3" /> Failed to connect to LLM.
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-[rgba(174,144,100,0.18)] p-3 bg-white flex items-center gap-2">
        <input
          ref={inputRef}
          name="message"
          type="text"
          placeholder="Message..."
          className="flex-1 bg-[rgba(255,253,248,0.5)] border border-[rgba(174,144,100,0.28)] rounded-[6px] outline-none text-[var(--text-primary)] px-3 py-2 text-sm focus:border-[var(--accent-green)] transition-colors"
          disabled={status !== "ready"}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="h-[38px] w-[38px] rounded-[6px] bg-[var(--accent-green)] text-white flex items-center justify-center transition hover:bg-[#152F22] disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

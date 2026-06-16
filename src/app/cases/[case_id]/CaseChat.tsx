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
      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] bg-[var(--control-muted)] p-4">
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
                    : "border border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--text-primary)] rounded-bl-sm"
                }`}>
                  {/* @ts-expect-error UIMessage content is present on persisted messages */}
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
            <div className="flex items-center gap-2 rounded-xl rounded-bl-sm border border-[var(--border-soft)] bg-[var(--control-muted)] px-3 py-2 text-sm text-[var(--text-primary)]">
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
        <div className="danger-callout flex items-center gap-2 border-x-0 border-b-0 px-4 py-2 text-xs">
          <AlertCircle className="w-3 h-3" /> Failed to connect to LLM.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--border-soft)] bg-[var(--control-muted)] p-3">
        <input
          ref={inputRef}
          name="message"
          type="text"
          placeholder="Message..."
          className="form-control flex-1 px-3 py-2 text-sm"
          disabled={status !== "ready"}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[6px] bg-[var(--accent-green)] text-white transition hover:bg-[var(--accent-green-hover)] disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

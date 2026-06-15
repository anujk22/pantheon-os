"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  FileText,
  Grid2X2,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";

const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
});

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full border border-[rgba(174,144,100,0.32)] bg-[rgba(250,246,238,0.82)] text-sm text-[var(--text-primary)] shadow-[inset_0_1px_4px_rgba(72,56,38,0.07)]">
        You
      </div>
    );
  }

  return (
    <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-full border border-[rgba(174,144,100,0.45)] bg-[#eee5d8] shadow-[0_6px_16px_rgba(72,56,38,0.12)]">
      <Image
        src="/athena.png"
        alt="Athena"
        fill
        sizes="58px"
        className="relief-avatar object-cover"
      />
    </div>
  );
}

function MessageHeader({
  name,
  time,
}: {
  name: string;
  time: string;
}) {
  return (
    <div className="mb-2 flex items-baseline gap-4">
      <h3 className="text-[15px] font-semibold text-[var(--accent-green)]">
        {name}
      </h3>
      <span className="text-sm text-[var(--text-muted)]">{time}</span>
    </div>
  );
}

function EmptyCommandState() {
  return (
    <div className="flex h-full items-center justify-center px-4 text-center">
      <div className="max-w-xl">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-[rgba(174,144,100,0.34)] bg-[rgba(255,253,248,0.66)] shadow-[inset_0_1px_4px_rgba(72,56,38,0.07)]">
          <Sparkles className="h-7 w-7 text-[var(--accent-green)]" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
          ATHENA IS READY
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          No conversation is loaded yet. Send a message to Athena. Responses require
          your configured local or hosted LLM endpoint to be running.
        </p>
      </div>
    </div>
  );
}

function LiveMessages({
  messages,
  isLoading,
}: {
  messages: ReturnType<typeof useChat>["messages"];
  isLoading: boolean;
}) {
  return (
    <div className="space-y-5">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const text = message.parts
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("");

        return (
          <div key={message.id || index} className="flex items-start gap-4">
            <Avatar role={isUser ? "user" : "assistant"} />
            <div className="min-w-0 flex-1 pt-1">
              <MessageHeader
                name={isUser ? "You" : "Athena"}
                time={new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              />
              <div className="max-w-[820px] whitespace-pre-wrap text-[1rem] leading-relaxed">
                {text || (isUser ? "" : "No text returned.")}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex items-center gap-4 pl-0 text-sm font-medium text-[var(--accent-green)] min-[720px]:pl-[72px]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Athena is contacting the configured model.
        </div>
      )}
    </div>
  );
}

function ChatError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mb-3 flex flex-col gap-3 rounded-[8px] border border-[#b94d3f]/25 bg-[#fff7f4]/80 p-3 text-sm text-[#7b2d25] min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
      <div className="flex min-w-0 items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-[6px] border border-[#b94d3f]/25 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#7b2d25] transition hover:bg-white"
      >
        Retry
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { messages, sendMessage, status, error, regenerate, clearError } =
    useChat({
      id: "command-layer",
      transport: chatTransport,
    });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const hasLiveMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get("message") ?? "").trim();
    if (!text || status !== "ready") return;

    clearError();
    if (inputRef.current) inputRef.current.value = "";
    await sendMessage({ text });
  };

  return (
    <section className="stone-panel architectural-corners flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-5 pt-5 custom-scrollbar min-[720px]:px-6 min-[720px]:pt-7 min-[1500px]:px-8">
        {hasLiveMessages ? (
          <LiveMessages messages={messages} isLoading={isLoading} />
        ) : (
          <EmptyCommandState />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative z-10 px-4 pb-4 min-[720px]:px-6 min-[1500px]:px-8">
        {error ? (
          <ChatError
            message={error.message || "Athena could not reach the configured model."}
            onRetry={() => regenerate()}
          />
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="stone-card architectural-corners p-3 transition focus-within:border-[var(--accent-green)]"
        >
          <input
            ref={inputRef}
            name="message"
            type="text"
            placeholder="Message Athena..."
            className="mb-3 h-8 w-full bg-transparent px-2 text-base text-[var(--text-primary)] outline-none placeholder:text-[#6f665c]"
            disabled={status !== "ready"}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-[var(--text-primary)] min-[720px]:gap-4">
              {[Paperclip, Grid2X2, Sparkles, FileText, CalendarDays].map(
                (Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled
                    title="This action is not connected yet."
                    className="grid h-8 w-8 place-items-center rounded-[6px] text-[var(--text-muted)] opacity-55"
                  >
                    <Icon className="h-5 w-5 stroke-[1.7]" />
                  </button>
                )
              )}
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                disabled={status !== "ready"}
                className="flex h-11 w-11 items-center justify-center gap-3 rounded-l-[7px] border border-[rgba(174,144,100,0.34)] bg-[rgba(255,253,248,0.72)] text-sm font-bold tracking-[0.22em] text-[var(--accent-green)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition hover:border-[var(--accent-green)] hover:bg-white disabled:opacity-50 min-[720px]:w-auto min-[720px]:justify-start min-[720px]:px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 fill-[var(--accent-green)]" />
                )}
                <span className="hidden min-[720px]:inline">SEND</span>
              </button>
              <button
                type="button"
                disabled
                title="Send options are not connected yet."
                className="grid h-11 w-[52px] place-items-center rounded-r-[7px] border-y border-r border-[rgba(32,56,43,0.36)] bg-[var(--accent-green)] text-white opacity-80"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          Athena only responds when the configured LLM endpoint is reachable.
        </p>
      </div>
    </section>
  );
}

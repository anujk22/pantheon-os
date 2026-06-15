"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Grid2X2,
  ListChecks,
  Loader2,
  Paperclip,
  PenLine,
  Send,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";

const planLines = [
  {
    icon: Target,
    label: "Focus:",
    text: "Deep work in the morning, stakeholder sync in the afternoon.",
  },
  {
    icon: ListChecks,
    label: "Orion Project:",
    text: "I've outlined phases, key milestones, and immediate next steps.",
  },
  {
    icon: Bell,
    label: "Heads up:",
    text: "Budget review due tomorrow 10:00 AM.",
  },
];

const actionChips = [
  { icon: Timer, label: "Yes, schedule focus time" },
  { icon: ClipboardCheck, label: "Yes, prepare the brief" },
  { icon: PenLine, label: "Edit plan" },
];

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

function ContextPackCard() {
  return (
    <div className="stone-card architectural-corners mt-4 max-w-[790px] p-3 min-[720px]:ml-[72px]">
      <div className="flex flex-col gap-4 rounded-[7px] border border-[rgba(174,144,100,0.18)] bg-[rgba(255,255,255,0.26)] p-3 min-[720px]:flex-row min-[720px]:items-center min-[720px]:gap-5">
        <div className="relative grid h-[112px] w-[112px] shrink-0 place-items-center rounded-[7px] border border-[rgba(174,144,100,0.24)] bg-[rgba(250,247,240,0.72)]">
          <FileText className="h-[60px] w-[60px] text-[var(--accent-green)]" />
          <span className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full border border-[rgba(174,144,100,0.28)] bg-[#fbf8f1] shadow-[0_7px_16px_rgba(72,56,38,0.14)]">
            <Check className="h-5 w-5 text-[var(--accent-green)]" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-col gap-1 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between min-[720px]:gap-4">
            <p className="font-serif text-[0.98rem] font-semibold tracking-[0.12em]">
              CONTEXT PACK GENERATED
            </p>
            <span className="text-sm text-[var(--text-muted)]">9:03 AM</span>
          </div>
          <h4 className="text-base font-semibold">Orion Project - Initial Brief</h4>
          <p className="mt-1 max-w-[430px] text-sm leading-relaxed text-[var(--text-primary)]">
            Includes project overview, goals, stakeholders, risks, and next actions.
          </p>
          <p className="mt-3 text-xs font-medium tracking-[0.12em] text-[var(--text-muted)]">
            DOCX <span className="px-2">•</span> 14 PAGES <span className="px-2">•</span> 2.4 MB
          </p>
        </div>

        <button className="hidden h-10 shrink-0 items-center gap-3 rounded-[6px] border border-[rgba(174,144,100,0.32)] bg-[rgba(255,253,248,0.72)] px-5 text-xs font-bold tracking-[0.14em] text-[var(--accent-green)] transition hover:border-[var(--accent-green)] hover:bg-white min-[760px]:flex">
          VIEW PACK
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

function MockConversation() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar role="user" />
        <div className="min-w-0 flex-1 pt-1">
          <MessageHeader name="You" time="9:02 AM" />
          <p className="text-[1rem] leading-relaxed">
            Good morning, Athena. Help me plan my day and organize the Orion Project.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <Avatar role="assistant" />
        <div className="min-w-0 flex-1 pt-1">
          <MessageHeader name="Athena" time="9:02 AM" />
          <p className="text-[1rem] leading-relaxed">
            Good morning. Here&apos;s your plan for today and a starter structure for Orion.
          </p>

          <div className="mt-5 space-y-3">
            {planLines.map((line) => (
              <div key={line.label} className="grid grid-cols-[24px_1fr] items-start gap-2 text-sm leading-relaxed min-[720px]:grid-cols-[24px_112px_1fr]">
                <line.icon className="mt-0.5 h-5 w-5 text-[var(--accent-green)]" />
                <span className="font-semibold text-[var(--accent-green)]">{line.label}</span>
                <span className="col-start-2 min-[720px]:col-start-auto">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ContextPackCard />

      <div className="flex items-start gap-4 pt-1">
        <Avatar role="assistant" />
        <div className="min-w-0 flex-1 pt-1">
          <MessageHeader name="Athena" time="9:03 AM" />
          <p className="text-[1rem] leading-relaxed">
            Shall I block focus time on your calendar and prepare the stakeholder brief?
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {actionChips.map((chip) => (
              <button
                key={chip.label}
                className="flex h-9 items-center gap-2 rounded-[7px] border border-[rgba(174,144,100,0.32)] bg-[rgba(255,253,248,0.58)] px-4 text-sm font-medium text-[var(--accent-green)] transition hover:border-[var(--accent-green)] hover:bg-white"
              >
                <chip.icon className="h-4 w-4" />
                {chip.label}
              </button>
            ))}
          </div>
        </div>
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
                {text}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex items-center gap-4 pl-[72px] text-sm font-medium text-[var(--accent-green)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Athena is composing.
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { messages, sendMessage, status } = useChat({ id: "command-layer" });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";
  const hasLiveMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    await sendMessage({ text });
  };

  return (
    <section className="stone-panel architectural-corners flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-5 pt-5 custom-scrollbar min-[720px]:px-6 min-[720px]:pt-7 min-[1500px]:px-8">
        {hasLiveMessages ? (
          <LiveMessages messages={messages} isLoading={isLoading} />
        ) : (
          <MockConversation />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative z-10 px-4 pb-4 min-[720px]:px-6 min-[1500px]:px-8">
        <form
          onSubmit={handleSubmit}
          className="stone-card architectural-corners p-3 transition focus-within:border-[var(--accent-green)]"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Message Athena..."
            className="mb-3 h-8 w-full bg-transparent px-2 text-base text-[var(--text-primary)] outline-none placeholder:text-[#6f665c]"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-[var(--text-primary)] min-[720px]:gap-4">
              {[Paperclip, Grid2X2, Sparkles, FileText, CalendarDays].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-[6px] transition hover:bg-[rgba(52,84,63,0.08)] hover:text-[var(--accent-green)]"
                >
                  <Icon className="h-5 w-5 stroke-[1.7]" />
                </button>
              ))}
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
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
                className="grid h-11 w-[52px] place-items-center rounded-r-[7px] border-y border-r border-[rgba(32,56,43,0.36)] bg-[var(--accent-green)] text-white transition hover:bg-[#20382b]"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          Athena can make mistakes. Verify important information.
        </p>
      </div>
    </section>
  );
}

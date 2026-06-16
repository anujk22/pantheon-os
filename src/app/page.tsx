/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  FileText,
  Grid2X2,
  Loader2,
  MessageSquare,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

const chatTransport = new DefaultChatTransport({
  api: "/api/chat",
});

type ChatSessionSummary = {
  id: string;
  title: string;
  folder: string | null;
  summary: string | null;
  updatedAt: string;
};

const composerTools = [
  {
    icon: Grid2X2,
    label: "Context",
    detail: "Attach saved context packs. Not connected yet.",
  },
  {
    icon: Sparkles,
    label: "Refine",
    detail: "Ask Athena to clarify or tighten your prompt. Not connected yet.",
  },
  {
    icon: FileText,
    label: "Artifact",
    detail: "Save useful output as an artifact. Not connected yet.",
  },
  {
    icon: CalendarDays,
    label: "Schedule",
    detail: "Draft calendar blocks from this conversation. Not connected yet.",
  },
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
    <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-full border border-[var(--border-soft)] bg-[var(--control-muted)] shadow-[0_6px_16px_rgba(72,56,38,0.12)]">
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
  isUser,
}: {
  name: string;
  time: string;
  isUser?: boolean;
}) {
  return (
    <div className={`mb-2 flex items-baseline gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
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
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-[var(--border-soft)] bg-[var(--control-muted)] shadow-[inset_0_1px_4px_rgba(72,56,38,0.07)]">
          <Sparkles className="h-7 w-7 text-[var(--accent-green)]" />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
          ATHENA IS READY
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          Send a message to Athena. Responses require your configured local or hosted LLM endpoint to be running.
        </p>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-4 flex-row">
      <Avatar role="assistant" />
      <div className="min-w-0 flex-1 pt-1 flex flex-col items-start text-left">
        <MessageHeader
          name="Athena"
          time={new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          isUser={false}
        />
        <div className="flex h-6 items-center">
          <span className="text-2xl font-bold leading-none tracking-widest text-[var(--accent-green)] opacity-70">
            {dots}
          </span>
        </div>
      </div>
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

function MarkdownMessage({ text }: { text: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <div className="chat-markdown">
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const first = lines[0] ?? "";

        if (/^#{1,3}\s+/.test(first)) {
          return (
            <h4 key={index}>
              <InlineMarkdown text={first.replace(/^#{1,3}\s+/, "")} />
            </h4>
          );
        }

        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, itemIndex) => (
                <li key={itemIndex}>
                  <InlineMarkdown text={line.replace(/^[-*]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\.\s+/.test(line))) {
          return (
            <ol key={index}>
              {lines.map((line, itemIndex) => (
                <li key={itemIndex}>
                  <InlineMarkdown text={line.replace(/^\d+\.\s+/, "")} />
                </li>
              ))}
            </ol>
          );
        }

        if (lines.length > 1 && lines.every((line) => line.includes("|"))) {
          return (
            <pre key={index}>
              <code>{lines.join("\n")}</code>
            </pre>
          );
        }

        return (
          <p key={index}>
            <InlineMarkdown text={lines.join(" ")} />
          </p>
        );
      })}
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
        // @ts-ignore
        const text = message.parts
          ?.map((part: any) => (part.type === "text" ? part.text : ""))
          // @ts-ignore
          .join("") || message.content;

        const files = message.parts?.filter((p: any) => p.type === "file") as any[];

        return (
          <div key={message.id || index} className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <Avatar role={isUser ? "user" : "assistant"} />
            <div className={`min-w-0 flex-1 pt-1 flex flex-col ${isUser ? "items-end text-right" : "items-start text-left"}`}>
              <MessageHeader
                name={isUser ? "You" : "Athena"}
                // @ts-ignore
                time={message.createdAt ? new Date(message.createdAt).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                }) : "Just now"}
                isUser={isUser}
              />
              
              {files && files.length > 0 && (
                <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
                  {files.map((file, i) => (
                    file.data && typeof file.data === "string" && file.data.startsWith("data:image") ? (
                      <div key={i} className="relative h-24 w-24 overflow-hidden rounded-[8px] border border-[rgba(174,144,100,0.34)]">
                        <Image src={file.data} alt="Attachment" fill className="object-cover" />
                      </div>
                    ) : (
                      <div key={i} className="flex items-center gap-2 rounded-[6px] border border-[var(--border-soft)] bg-[var(--control-subtle)] px-3 py-2 text-sm text-[var(--text-muted)]">
                        <Paperclip className="h-4 w-4" />
                        Attached File
                      </div>
                    )
                  ))}
                </div>
              )}

              <div className={`chat-bubble max-w-[820px] ${isUser ? "chat-bubble-user" : "chat-bubble-athena"}`}>
                {text ? (
                  <MarkdownMessage text={text} />
                ) : (
                  !files?.length && (isUser ? "" : "No text returned.")
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && <ThinkingIndicator />}
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
    <div className="danger-callout mb-3 flex flex-col gap-3 rounded-[8px] p-3 text-sm min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
      <div className="flex min-w-0 items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-[6px] border border-[var(--danger-border)] bg-[var(--control-muted)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--control)]"
      >
        Retry
      </button>
    </div>
  );
}

function ChatHistoryDrawer({
  isOpen,
  activeChatId,
  onToggle,
}: {
  isOpen: boolean;
  activeChatId: string | null;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSessions = async () => {
    setIsLoading(true);
    const response = await fetch("/api/chat/history");
    if (response.ok) {
      setSessions(await response.json());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const deleteSession = async (sessionId: string) => {
    await fetch(`/api/chat/session/${sessionId}`, { method: "DELETE" });
    setSessions((current) => current.filter((session) => session.id !== sessionId));
    if (activeChatId === sessionId) {
      router.push("/");
    }
  };

  return (
    <aside
      className={`relative z-20 flex min-h-0 shrink-0 flex-col border-r border-[var(--border-soft)] bg-[var(--control-muted)] transition-[width] duration-200 ${
        isOpen ? "w-[280px]" : "w-12"
      }`}
    >
      <div className="flex h-12 items-center justify-between border-b border-[var(--border-soft)] px-2">
        {isOpen ? (
          <span className="px-2 text-xs font-semibold tracking-[0.14em] text-[var(--accent-bronze)]">
            CHATS
          </span>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="grid h-8 w-8 place-items-center rounded-[6px] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          title={isOpen ? "Collapse chat history" : "Open chat history"}
          aria-label={isOpen ? "Collapse chat history" : "Open chat history"}
        >
          {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      </div>

      {isOpen ? (
        <>
          <div className="border-b border-[var(--border-soft)] p-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[var(--accent-green)] bg-[var(--success-bg)] px-3 py-2 text-sm font-semibold text-[var(--success-text)] transition hover:bg-[var(--surface-hover)]"
            >
              <PlusCircle className="h-4 w-4" />
              New chat
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-green)]" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="px-3 py-4 text-sm leading-relaxed text-[var(--text-muted)]">
                Past conversations will appear here after Athena replies.
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-1 rounded-[8px] border px-2 py-2 transition ${
                      activeChatId === session.id
                        ? "border-[var(--accent-green)] bg-[var(--success-bg)]"
                        : "border-transparent hover:border-[var(--border-soft)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/?chat=${session.id}`)}
                      className="min-w-0 flex-1 text-left"
                      title={session.summary || session.title}
                    >
                      <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                        {session.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
                        {session.summary || "No summary yet"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-[var(--text-subtle)] opacity-0 transition hover:bg-[var(--danger-bg)] hover:text-[var(--danger-text)] group-hover:opacity-100"
                      title="Delete conversation"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="grid h-8 w-8 place-items-center rounded-[6px] text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            title="New chat"
            aria-label="New chat"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}

function ChatWindow({ initialMessages, chatId }: { initialMessages: any[]; chatId: string | null }) {
  const router = useRouter();
  const [sessionChatId] = useState(() => chatId || `new-chat-${Date.now()}`);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const { messages, sendMessage, status, error, regenerate, clearError } =
    useChat({
      id: sessionChatId,
      // @ts-ignore
      initialMessages,
      transport: chatTransport,
      onFinish: () => {
        if (!chatId) {
          router.refresh();
        }
      }
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const isLoading = status === "submitted" || status === "streaming";
  const hasLiveMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    // If we have messages, and we are not currently viewing a saved chat ID in the URL,
    // automatically append the new sessionChatId to the URL so reloading saves it.
    if (messages.length > 0 && !chatId) {
      window.history.replaceState(null, "", `/?chat=${sessionChatId}`);
    }
  }, [messages.length, chatId, sessionChatId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get("message") ?? "").trim();
    
    if ((!text && selectedFiles.length === 0) || status !== "ready") return;

    clearError();
    if (inputRef.current) inputRef.current.value = "";
    
    // Create FileList object manually if we need to
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach((file) => dataTransfer.items.add(file));

    await sendMessage({ 
      text, 
      files: dataTransfer.files.length > 0 ? dataTransfer.files : undefined 
    });
    
    setSelectedFiles([]);
  };

  return (
    <section className="stone-panel architectural-corners flex h-full min-h-0 overflow-hidden">
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        activeChatId={chatId}
        onToggle={() => setIsHistoryOpen((current) => !current)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-5 pt-5 custom-scrollbar min-[720px]:px-6 min-[720px]:pt-7 min-[1500px]:px-8 flex flex-col">
        {hasLiveMessages ? (
          <>
            <div className="flex-1 shrink min-h-[40px]" />
            <div className="shrink-0">
              <LiveMessages messages={messages} isLoading={isLoading} />
            </div>
          </>
        ) : (
          <EmptyCommandState />
        )}
        <div ref={messagesEndRef} className="shrink-0" />
      </div>

      <div className="relative z-10 px-4 pb-4 min-[720px]:px-6 min-[1500px]:px-8">
        {error ? (
          <ChatError
            message={error.message || "Athena could not reach the configured model."}
            onRetry={() => regenerate()}
          />
        ) : null}

        {selectedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 rounded-[6px] border border-[var(--accent-green)] bg-[var(--control-muted)] px-2 py-1 text-xs text-[var(--accent-green)]">
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button type="button" onClick={() => removeFile(i)} className="ml-1 hover:text-[var(--text-primary)]">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="stone-card architectural-corners p-3 transition focus-within:border-[var(--accent-green)]"
        >
          <input
            ref={inputRef}
            name="message"
            type="text"
            placeholder="Message Athena..."
            className="mb-3 h-8 w-full bg-transparent px-2 text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
            disabled={status !== "ready"}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-[var(--text-primary)]">
              <label
                title="Attach file"
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] px-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={status !== "ready"}
                />
                <Paperclip className="h-5 w-5 stroke-[1.7]" />
                <span className="hidden text-xs font-medium min-[1100px]:inline">Attach</span>
              </label>

              {composerTools.map(
                ({ icon: Icon, label, detail }) => (
                  <button
                    key={label}
                    type="button"
                    disabled
                    title={detail}
                    className="flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[var(--text-muted)] opacity-60"
                  >
                    <Icon className="h-5 w-5 stroke-[1.7]" />
                    <span className="hidden text-xs font-medium min-[1100px]:inline">{label}</span>
                  </button>
                )
              )}
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                disabled={status !== "ready"}
                className="flex h-11 w-11 items-center justify-center gap-3 rounded-[7px] border border-[var(--accent-bronze)] bg-[var(--success-bg)] text-sm font-bold tracking-[0.18em] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(246,231,191,0.16),0_8px_22px_rgba(0,0,0,0.16)] transition hover:border-[var(--accent-green)] hover:bg-[var(--surface-hover)] disabled:opacity-50 min-[720px]:w-auto min-[720px]:justify-start min-[720px]:px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-[var(--accent-green)]" />
                )}
                <span className="hidden min-[720px]:inline">SEND</span>
              </button>
              <button
                type="button"
                disabled
                title="Send options are not connected yet."
                className="ml-2 grid h-11 w-11 place-items-center rounded-[7px] border border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--text-muted)] opacity-70"
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
      </div>
    </section>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");
  
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setTimeout(() => {
        setInitialMessages([]);
        setSessionLoaded(true);
      }, 0);
      return;
    }

    setSessionLoaded(false);
    fetch(`/api/chat/session/${chatId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load session");
        return res.json();
      })
      .then((data) => {
        setInitialMessages(data.messages);
        setSessionLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setInitialMessages([]);
        setSessionLoaded(true);
      });
  }, [chatId]);

  if (!sessionLoaded) {
    return (
      <section className="stone-panel architectural-corners flex h-full min-h-0 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-green)]" />
      </section>
    );
  }

  return <ChatWindow key={chatId || "new"} initialMessages={initialMessages} chatId={chatId} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <section className="stone-panel architectural-corners flex h-full min-h-0 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-green)]" />
      </section>
    }>
      <DashboardContent />
    </Suspense>
  );
}

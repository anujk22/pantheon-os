/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { routeAgentDisplay, type AgentRoutingDisplay } from "@/lib/agent-routing";
import {
  AlertCircle,
  Archive,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  Grid2X2,
  Landmark,
  Loader2,
  MessageSquare,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Save,
  Send,
  ShieldCheck,
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

type CaseSummary = {
  id: string;
  title: string;
  status: string;
  _count: {
    tasks: number;
    artifacts: number;
    memories: number;
  };
};

type LedgerEntry = {
  id: string;
  kind: string;
  title: string;
  detail: string | null;
  payloadJson: string | null;
  createdAt: string;
};

type ActionDraft =
  | {
      kind: "save_artifact";
      title: string;
      type: string;
      content: string;
      description: string;
    }
  | {
      kind: "create_task";
      title: string;
      description: string;
    }
  | {
      kind: "create_case";
      title: string;
      summary: string;
      taskCandidates: Array<{ title: string; description: string }>;
      artifactCandidates: Array<{ title: string; type: string; content: string }>;
      memoryCandidates: Array<{ content: string; memoryType: string }>;
      suggestedAgents: string[];
    }
  | {
      kind: "save_memory";
      title: string;
      content: string;
      memoryType: string;
    };

const composerTools = [
  {
    action: "context",
    icon: Grid2X2,
    label: "Context",
    detail: "Ask the routed agent to use relevant Pantheon memory.",
  },
  {
    action: "refine",
    icon: Sparkles,
    label: "Refine",
    detail: "Prepare an editable refinement request.",
  },
  {
    action: "artifact",
    icon: FileText,
    label: "Artifact",
    detail: "Prepare an editable artifact request.",
  },
  {
    action: "schedule",
    icon: CalendarDays,
    label: "Schedule",
    detail: "Prepare an editable schedule request.",
  },
] as const;

type ComposerToolAction = typeof composerTools[number]["action"];

const personaCards = [
  {
    name: "Hermes",
    role: "Planning router",
    purpose: "Turns goals into cases, briefs, and next actions.",
    image: "/persona-hermes-v2.png",
    state: "Role mapped",
    alt: "Hermes profile art",
  },
  {
    name: "Athena",
    role: "Mission architect",
    purpose: "Synthesizes context and chooses the cleanest path.",
    image: "/persona-athena-v2.png",
    state: "Role mapped",
    alt: "Athena profile art",
  },
  {
    name: "Apollo",
    role: "Insight analyst",
    purpose: "Finds patterns across research, artifacts, and memory.",
    image: "/persona-apollo-v2.png",
    state: "Role mapped",
    alt: "Apollo profile art",
  },
  {
    name: "Artemis",
    role: "Execution tracker",
    purpose: "Keeps tasks sharp, scoped, and moving.",
    image: "/persona-artemis-v2.png",
    state: "Role mapped",
    alt: "Artemis profile art",
  },
  {
    name: "Hephaestus",
    role: "Systems engineer",
    purpose: "Builds automations, tools, and integration plumbing.",
    image: "/persona-hephaestus-v2.png",
    state: "Role mapped",
    alt: "Hephaestus profile art",
  },
  {
    name: "Dionysus",
    role: "Creative catalyst",
    purpose: "Explores names, narratives, designs, and alternatives.",
    image: "/persona-dionysus-v2.png",
    state: "Role mapped",
    alt: "Dionysus profile art",
  },
];

function Avatar({ role, agent }: { role: "user" | "assistant"; agent?: AgentRoutingDisplay }) {
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
        src={agent?.image || "/persona-athena-v2.png"}
        alt={agent?.name || "Assistant"}
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
    <div className="grid h-full min-h-0 gap-3 overflow-y-auto pr-1 custom-scrollbar">
      <section className="stone-card architectural-corners grid gap-5 p-4 min-[1500px]:grid-cols-[360px_minmax(0,1fr)] min-[1500px]:p-5">
        <div className="relative h-[220px] overflow-hidden rounded-[4px] border border-[var(--border-soft)] bg-[var(--control-muted)] min-[1500px]:h-auto min-[1500px]:aspect-square">
          <Image
            src="/mission-control-athena-v2.png"
            alt="Athena standing statue for Mission Control"
            fill
            sizes="360px"
            priority
            className="relief-avatar object-cover object-center"
          />
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.72))] p-3">
            <p className="font-serif text-xs font-semibold tracking-[0.22em] text-[var(--text-primary)]">
              COMMAND PROFILE
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-center gap-2 border-b border-[var(--border-soft)] pb-2">
            <Landmark className="h-4 w-4 text-[var(--accent-bronze)]" />
            <p className="font-serif text-xs font-semibold tracking-[0.22em] text-[var(--accent-bronze)]">
              MISSION CONTROL
            </p>
          </div>

          <h2 className="max-w-4xl font-serif text-[2.1rem] font-semibold leading-[1.05] tracking-0 text-[var(--text-primary)] min-[1500px]:text-[3.1rem]">
            Every mission needs a <span className="text-[var(--accent-bronze)]">worthy goal.</span>
          </h2>

          <div className="mt-4 rounded-[4px] border border-[var(--border-soft)] bg-[var(--control-muted)]">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-3 py-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                Local command prompt
              </p>
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                Real endpoint required
              </span>
            </div>
            <div className="p-4 font-mono text-[12px] leading-relaxed text-[var(--text-primary)] min-[1500px]:text-[13px]">
              <p>
                Use Athena as a planning and synthesis partner for the current mission.
                Attach context when needed, then send one clear request. Pantheon will only
                show responses from the configured local or hosted LLM endpoint.
              </p>
              <p className="mt-3 text-[var(--text-muted)]">
                No background agents are running from this screen yet. Queue, memory,
                artifacts, and cases remain reviewable local records.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/settings"
              className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-[var(--border-soft)] bg-[var(--control-subtle)] px-3 font-serif text-[11px] font-semibold tracking-[0.16em] text-[var(--text-primary)] transition hover:border-[var(--accent-green)] hover:bg-[var(--surface-hover)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent-green)]" />
              CHECK SYSTEM
            </Link>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-green)]" />
              Chat API waits for your configured model
            </span>
          </div>
        </div>
      </section>

      <section className="stone-card architectural-corners p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border-soft)] pb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[var(--accent-bronze)]" />
            <p className="font-serif text-xs font-semibold tracking-[0.22em] text-[var(--accent-bronze)]">
              PERSONA ROSTER
            </p>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
            Purpose-built roles
          </span>
        </div>

        <div className="grid gap-3 min-[720px]:grid-cols-2 min-[1300px]:grid-cols-3 min-[1700px]:grid-cols-6">
          {personaCards.map((persona) => (
            <article
              key={persona.name}
              className="overflow-hidden rounded-[4px] border border-[var(--border-soft)] bg-[var(--control-muted)]"
            >
              <div className="relative aspect-square w-full border-b border-[var(--border-soft)] bg-[var(--control)]">
                {persona.image ? (
                  <Image
                    src={persona.image}
                    alt={persona.alt}
                    fill
                    sizes="(min-width: 1700px) 190px, (min-width: 1300px) 33vw, (min-width: 720px) 50vw, 100vw"
                    className="relief-avatar object-cover object-center"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={persona.alt}
                    className="flex h-full items-center justify-center px-4 text-center font-serif text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-subtle)]"
                  >
                    {persona.name} profile here
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
                  {persona.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{persona.role}</p>
                <p className="mt-2 min-h-[2.25rem] text-xs leading-relaxed text-[var(--text-subtle)]">
                  {persona.purpose}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--success-text)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-green)]" />
                  {persona.state}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 min-[980px]:grid-cols-3">
        <Link href="/agents" className="stone-card architectural-corners p-4 transition hover:border-[var(--accent-green)]">
          <Archive className="mb-3 h-4 w-4 text-[var(--accent-bronze)]" />
          <h3 className="font-serif text-sm font-semibold tracking-[0.16em] text-[var(--text-primary)]">
            AGENCY QUEUE
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Review proposed local actions before execution.
          </p>
        </Link>
        <Link href="/artifacts" className="stone-card architectural-corners p-4 transition hover:border-[var(--accent-green)]">
          <FileText className="mb-3 h-4 w-4 text-[var(--accent-bronze)]" />
          <h3 className="font-serif text-sm font-semibold tracking-[0.16em] text-[var(--text-primary)]">
            ARTIFACT VAULT
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Open saved outputs, references, and durable work.
          </p>
        </Link>
        <Link href="/vault" className="stone-card architectural-corners p-4 transition hover:border-[var(--accent-green)]">
          <MessageSquare className="mb-3 h-4 w-4 text-[var(--accent-bronze)]" />
          <h3 className="font-serif text-sm font-semibold tracking-[0.16em] text-[var(--text-primary)]">
            MEMORY STREAM
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            Inspect reviewed memory records and local context.
          </p>
        </Link>
      </section>
    </div>
  );
}

function ThinkingIndicator({ agent }: { agent: AgentRoutingDisplay }) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-4 flex-row">
      <Avatar role="assistant" agent={agent} />
      <div className="min-w-0 flex-1 pt-1 flex flex-col items-start text-left">
        <MessageHeader
          name={agent.name}
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

function getMessageText(message: any) {
  const text = message.parts
    ?.filter((part: any) => part.type === "text")
    .map((part: any) => part.text ?? "")
    .join("");

  if (text) return text;

  const reasoningText = message.parts
    ?.filter((part: any) => part.type === "reasoning")
    .map((part: any) => part.text ?? "")
    .join("");

  return reasoningText || message.content || "";
}

function getPreviousUserText(messages: any[], index: number) {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return getMessageText(messages[i]);
  }
  return "";
}

function LiveMessages({
  messages,
  isLoading,
  contextReceipt,
}: {
  messages: ReturnType<typeof useChat>["messages"];
  isLoading: boolean;
  contextReceipt: LedgerEntry | null;
}) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const latestUserText = latestUserMessage ? getMessageText(latestUserMessage) : "";
  const thinkingAgent = routeAgentDisplay(latestUserText);

  return (
    <div className="space-y-5">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const text = getMessageText(message);
        const displayAgent = isUser
          ? undefined
          : routeAgentDisplay(getPreviousUserText(messages, index));

        const files = message.parts?.filter((p: any) => p.type === "file") as any[];

        return (
          <div key={message.id || index} className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <Avatar role={isUser ? "user" : "assistant"} agent={displayAgent} />
            <div className={`min-w-0 flex-1 pt-1 flex flex-col ${isUser ? "items-end text-right" : "items-start text-left"}`}>
              <MessageHeader
                name={isUser ? "You" : displayAgent?.name || "Athena"}
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

              {!isUser && contextReceipt ? <ContextReceipt entry={contextReceipt} /> : null}
            </div>
          </div>
        );
      })}

      {isLoading && <ThinkingIndicator agent={thinkingAgent} />}
    </div>
  );
}

function ContextReceipt({ entry }: { entry: LedgerEntry }) {
  let payload: any = null;
  try {
    payload = entry.payloadJson ? JSON.parse(entry.payloadJson) : null;
  } catch {
    payload = null;
  }

  const receiptParts = [
    payload?.agentName ? `Agent: ${payload.agentName}` : entry.title,
    payload?.case?.title ? `Case: ${payload.case.title}` : "Case: global chat",
    typeof payload?.memoryCount === "number" ? `Memories: ${payload.memoryCount}` : null,
    typeof payload?.recentSummaryCount === "number" ? `Summaries: ${payload.recentSummaryCount}` : null,
    typeof payload?.caseArtifactCount === "number" ? `Artifacts: ${payload.caseArtifactCount}` : null,
  ].filter(Boolean);

  return (
    <div className="mt-2 max-w-[820px] rounded-[6px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-3 py-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
      <span className="font-semibold text-[var(--accent-green)]">Context receipt:</span>{" "}
      {receiptParts.join(" | ")}
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

function classifyLikelyAction(text: string, hasFiles: boolean) {
  const normalized = text.toLowerCase();
  if (hasFiles) return "file context";
  if (/\b(tasks?|todos?|deadline|due|next actions?|blocker|finish|ship|create tasks?)\b/.test(normalized)) return "task proposal";
  if (/\b(case|project|workspace|promote|initiative)\b/.test(normalized)) return "case work";
  if (/\b(artifact|save|draft|document|note|summary|writeup)\b/.test(normalized)) return "artifact proposal";
  if (/\b(memory|remember|preference|always|never)\b/.test(normalized)) return "memory review";
  if (/\b(schedule|calendar|time block|plan my day|when)\b/.test(normalized)) return "schedule draft";
  return "chat response";
}

function buildConversationText(messages: any[]) {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${getMessageText(message)}`)
    .filter((line) => line.trim().length > 0)
    .join("\n\n");
}

function getLastAssistantText(messages: any[]) {
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  return lastAssistant ? getMessageText(lastAssistant) : "";
}

function getLastUserText(messages: any[]) {
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  return lastUser ? getMessageText(lastUser) : "";
}

function shortTitle(text: string, fallback: string) {
  const firstLine = text.split("\n").find((line) => line.trim())?.trim() || fallback;
  return firstLine.length > 70 ? `${firstLine.slice(0, 67).trim()}...` : firstLine;
}

function taskCandidatesFromText(text: string) {
  const candidates = text
    .split(/\n|\. /)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter((line) => line.length > 8)
    .slice(0, 5);

  return candidates.length > 0
    ? candidates.map((title) => ({ title, description: "" }))
    : [{ title: "Review conversation and define next action", description: text.slice(0, 400) }];
}

function agentsFromText(text: string) {
  const names = new Set<string>(["athena"]);
  const normalized = text.toLowerCase();
  if (/\b(task|todo|deadline|ship|finish)\b/.test(normalized)) names.add("artemis");
  if (/\b(research|analyze|summary|evidence|compare)\b/.test(normalized)) names.add("apollo");
  if (/\b(plan|strategy|case|project|roadmap)\b/.test(normalized)) names.add("hermes");
  if (/\b(code|bug|api|database|integration|automation)\b/.test(normalized)) names.add("hephaestus");
  if (/\b(design|creative|brand|copy|story)\b/.test(normalized)) names.add("dionysus");
  return Array.from(names);
}

function labelForTool(action: ComposerToolAction) {
  if (action === "refine") return "Refine";
  if (action === "artifact") return "Artifact";
  if (action === "schedule") return "Schedule";
  return "Context";
}

function ChatWindow({
  initialMessages,
  chatId,
  initialCaseId,
}: {
  initialMessages: any[];
  chatId: string | null;
  initialCaseId: string | null;
}) {
  const router = useRouter();
  const [sessionChatId] = useState(() => chatId || `new-chat-${Date.now()}`);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const { messages, sendMessage, status, error, regenerate, clearError, stop } =
    useChat({
      id: sessionChatId,
      // @ts-ignore
      messages: initialMessages,
      transport: chatTransport,
      onFinish: () => {
        if (!chatId) {
          router.refresh();
        }
        loadLedger();
      }
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [useMemoryContext, setUseMemoryContext] = useState(true);
  const [activeDraftTool, setActiveDraftTool] = useState<ComposerToolAction | null>(null);
  const [composerNotice, setComposerNotice] = useState("");
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId || "");
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [actionDraft, setActionDraft] = useState<ActionDraft | null>(null);
  const [actionNotice, setActionNotice] = useState("");
  
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

  useEffect(() => {
    setSelectedCaseId(initialCaseId || "");
  }, [initialCaseId]);

  const loadLedger = async () => {
    const response = await fetch(`/api/chat/ledger?sessionId=${encodeURIComponent(sessionChatId)}`);
    if (response.ok) {
      setLedgerEntries(await response.json());
    }
  };

  useEffect(() => {
    fetch("/api/cases")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setCases(data))
      .catch(() => setCases([]));
  }, []);

  useEffect(() => {
    if (hasLiveMessages || chatId) {
      loadLedger();
    }
  }, [hasLiveMessages, chatId, sessionChatId]);

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
    const text = inputValue.trim();
    
    if ((!text && selectedFiles.length === 0) || status !== "ready") return;

    clearError();
    setInputValue("");
    setActiveDraftTool(null);
    setComposerNotice("");
    
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach((file) => dataTransfer.items.add(file));

    await sendMessage({ 
      text,
      files: dataTransfer.files.length > 0 ? dataTransfer.files : undefined 
    }, {
      body: { useMemoryContext, caseId: selectedCaseId || null },
    });
    
    setSelectedFiles([]);
  };

  const handleComposerTool = (action: ComposerToolAction) => {
    if (status !== "ready") return;

    if (action === "context") {
      setUseMemoryContext((current) => !current);
      setComposerNotice(
        useMemoryContext
          ? "Memory context will be left out of the next send."
          : "Memory context will be requested on the next send."
      );
      inputRef.current?.focus();
      return;
    }

    if (activeDraftTool === action) {
      setInputValue("");
      setActiveDraftTool(null);
      setComposerNotice(`${labelForTool(action)} draft cleared.`);
      inputRef.current?.focus();
      return;
    }

    const draft = inputValue.trim();
    const prompts: Record<Exclude<ComposerToolAction, "context">, string> = {
      refine: `Refine this into a clearer request. First show the improved request, then wait for my confirmation before doing the work:\n\n${draft || "[write the rough idea here]"}`,
      artifact: `Turn this into artifact-ready output. Include a title, intended artifact type, clean structure, and any assumptions. If something important is missing, ask before drafting:\n\n${draft || "[describe the artifact or paste source material here]"}`,
      schedule: `Turn this into a practical schedule. Include blocks, durations, order, dependencies, and assumptions. If dates or constraints are missing, ask before making the schedule:\n\n${draft || "[describe the goal, deadline, constraints, and available time here]"}`,
    };
    const labels = {
      refine: "Refine draft prepared. Edit it, then press Send.",
      artifact: "Artifact draft prepared. Edit it, then press Send.",
      schedule: "Schedule draft prepared. Edit it, then press Send.",
    };

    clearError();
    setInputValue(prompts[action]);
    setActiveDraftTool(action);
    setComposerNotice(labels[action]);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleComposerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
    if (activeDraftTool) {
      setActiveDraftTool(null);
      setComposerNotice("Draft edited. Template lock cleared.");
    }
  };

  const attachCase = async (caseId: string) => {
    setSelectedCaseId(caseId);
    setActionNotice(caseId ? "Case context attached for future sends." : "Case context cleared.");

    if (!hasLiveMessages && !chatId) {
      setActionNotice(caseId ? "Case context will attach on first send." : "Case context cleared.");
      return;
    }

    const response = await fetch(`/api/chat/session/${sessionChatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: caseId || null }),
    });

    if (response.ok) {
      await loadLedger();
      router.refresh();
    }
  };

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleSecondaryAction = () => {
    if (isLoading) {
      stop();
      return;
    }

    if (inputValue.trim() || selectedFiles.length > 0) {
      setInputValue("");
      setSelectedFiles([]);
      setActiveDraftTool(null);
      setComposerNotice("");
      return;
    }

    router.push("/");
  };

  const selectedCase = cases.find((caseItem) => caseItem.id === selectedCaseId) || null;
  const latestDraftText = inputValue.trim() || getLastUserText(messages);
  const previewAgent = routeAgentDisplay(latestDraftText);
  const likelyAction = classifyLikelyAction(latestDraftText, selectedFiles.length > 0);
  const lastAssistantText = getLastAssistantText(messages);
  const conversationText = buildConversationText(messages);
  const hasMeaningfulConversation = messages.filter((message) => message.role === "user" || message.role === "assistant").length >= 2;
  const contextReceipt = ledgerEntries.find((entry) => entry.kind === "route_context") || null;

  const openArtifactDraft = () => {
    const content = lastAssistantText || conversationText;
    setActionDraft({
      kind: "save_artifact",
      title: shortTitle(content, "Conversation artifact"),
      type: "text",
      content,
      description: "Save assistant output as an artifact after approval.",
    });
  };

  const openTaskDraft = () => {
    const source = lastAssistantText || getLastUserText(messages) || inputValue;
    const firstTask = taskCandidatesFromText(source)[0];
    setActionDraft({
      kind: "create_task",
      title: firstTask.title,
      description: firstTask.description || source.slice(0, 600),
    });
  };

  const openPromoteCaseDraft = () => {
    const source = conversationText || inputValue;
    setActionDraft({
      kind: "create_case",
      title: shortTitle(getLastUserText(messages) || inputValue, "Promoted chat case"),
      summary: source.slice(0, 1200),
      taskCandidates: taskCandidatesFromText(source).slice(0, 3),
      artifactCandidates: lastAssistantText
        ? [{ title: shortTitle(lastAssistantText, "Conversation output"), type: "text", content: lastAssistantText }]
        : [],
      memoryCandidates: [],
      suggestedAgents: agentsFromText(source),
    });
  };

  const openMemoryReviewDraft = () => {
    const source = lastAssistantText || getLastUserText(messages) || conversationText;
    setActionDraft({
      kind: "save_memory",
      title: "Review memory candidate",
      content: source.slice(0, 700),
      memoryType: selectedCaseId ? "case_note" : "note",
    });
  };

  const stageActionDraft = async () => {
    if (!actionDraft) return;

    const payload =
      actionDraft.kind === "save_artifact"
        ? {
            title: actionDraft.title,
            type: actionDraft.type,
            content: actionDraft.content,
            caseId: selectedCaseId || null,
          }
        : actionDraft.kind === "create_task"
          ? {
              title: actionDraft.title,
              body: actionDraft.description,
              caseId: selectedCaseId || null,
            }
          : actionDraft.kind === "create_case"
            ? {
                title: actionDraft.title,
                body: actionDraft.summary,
                taskCandidates: actionDraft.taskCandidates,
                artifactCandidates: actionDraft.artifactCandidates,
                memoryCandidates: actionDraft.memoryCandidates,
                suggestedAgents: actionDraft.suggestedAgents,
              }
            : {
                content: actionDraft.content,
                type: actionDraft.memoryType,
                caseId: selectedCaseId || null,
              };

    const response = await fetch("/api/chat/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionChatId,
        kind: actionDraft.kind,
        title: actionDraft.title,
        description: actionDraft.kind === "create_case"
          ? "Promote this conversation into a reviewed case package."
          : "Staged from Command Layer. Requires Agency Queue approval.",
        payload,
      }),
    });

    if (response.ok) {
      setActionNotice("Action staged in Agency Queue for approval.");
      setActionDraft(null);
      await loadLedger();
      router.refresh();
    } else {
      const body = await response.json().catch(() => null);
      setActionNotice(body?.message || "Could not stage action.");
    }
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
              <LiveMessages messages={messages} isLoading={isLoading} contextReceipt={contextReceipt} />
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

        <CommandPreview
          agent={previewAgent}
          likelyAction={likelyAction}
          useMemoryContext={useMemoryContext}
          selectedCase={selectedCase}
          cases={cases}
          selectedCaseId={selectedCaseId}
          attachmentCount={selectedFiles.length}
          onAttachCase={attachCase}
        />

        {hasMeaningfulConversation ? (
          <ConversationDigest
            onSaveArtifact={openArtifactDraft}
            onCreateTask={openTaskDraft}
            onPromoteCase={openPromoteCaseDraft}
            onReviewMemory={openMemoryReviewDraft}
            suggestedAgents={agentsFromText(conversationText)}
          />
        ) : null}

        {actionDraft ? (
          <ActionDraftEditor
            draft={actionDraft}
            onChange={setActionDraft}
            onCancel={() => setActionDraft(null)}
            onStage={stageActionDraft}
          />
        ) : null}

        {actionNotice ? (
          <p className="mb-3 rounded-[7px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
            {actionNotice}
          </p>
        ) : null}

        <ActionLedger entries={ledgerEntries} />

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
          <textarea
            ref={inputRef}
            name="message"
            value={inputValue}
            onChange={handleComposerChange}
            onKeyDown={handleDraftKeyDown}
            placeholder="Message Pantheon..."
            className="mb-3 max-h-36 min-h-12 w-full resize-none bg-transparent px-2 py-1 text-base leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
            disabled={status !== "ready"}
            rows={2}
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
                ({ action, icon: Icon, label, detail }) => {
                  const isSelected =
                    (action === "context" && useMemoryContext) ||
                    action === activeDraftTool;

                  return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleComposerTool(action)}
                    disabled={status !== "ready"}
                    title={detail}
                    className={`flex h-8 items-center gap-1.5 rounded-[6px] px-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <Icon className="h-5 w-5 stroke-[1.7]" />
                    <span className="hidden text-xs font-medium min-[1100px]:inline">{label}</span>
                  </button>
                );
                }
              )}
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                disabled={status !== "ready" || (!inputValue.trim() && selectedFiles.length === 0)}
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
                onClick={handleSecondaryAction}
                title={isLoading ? "Stop response" : inputValue.trim() || selectedFiles.length > 0 ? "Clear draft" : "Start a new chat"}
                className="ml-2 grid h-11 w-11 place-items-center rounded-[7px] border border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--text-muted)] transition hover:border-[var(--accent-green)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                {isLoading ? <X className="h-4 w-4" /> : inputValue.trim() || selectedFiles.length > 0 ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          {composerNotice || (useMemoryContext ? "Memory context is requested for this turn." : "Memory context toggle is off for the next turn.")}
        </p>
      </div>
      </div>
    </section>
  );
}

function CommandPreview({
  agent,
  likelyAction,
  useMemoryContext,
  selectedCase,
  cases,
  selectedCaseId,
  attachmentCount,
  onAttachCase,
}: {
  agent: AgentRoutingDisplay;
  likelyAction: string;
  useMemoryContext: boolean;
  selectedCase: CaseSummary | null;
  cases: CaseSummary[];
  selectedCaseId: string;
  attachmentCount: number;
  onAttachCase: (caseId: string) => void;
}) {
  return (
    <section className="mb-3 rounded-[8px] border border-[var(--border-soft)] bg-[var(--control-muted)] p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--accent-green)]">
        <ShieldCheck className="h-4 w-4" />
        Command Preview
      </div>
      <div className="grid gap-2 text-xs min-[900px]:grid-cols-5">
        <PreviewItem label="Route" value={`${agent.name}, ${agent.role}`} />
        <PreviewItem label="Likely action" value={likelyAction} />
        <PreviewItem label="Memory" value={useMemoryContext ? "requested" : "off for next send"} />
        <PreviewItem label="Files" value={attachmentCount > 0 ? `${attachmentCount} attached` : "none"} />
        <label className="min-w-0">
          <span className="mb-1 block font-semibold text-[var(--text-muted)]">Case</span>
          <select
            value={selectedCaseId}
            onChange={(event) => onAttachCase(event.target.value)}
            className="form-control h-8 w-full px-2 text-xs"
          >
            <option value="">Global chat</option>
            {cases.map((caseItem) => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      {selectedCase ? (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Attached case: {selectedCase.title} ({selectedCase._count.tasks} tasks, {selectedCase._count.artifacts} artifacts, {selectedCase._count.memories} memories)
        </p>
      ) : null}
    </section>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[6px] border border-[var(--border-soft)] bg-[var(--control-subtle)] px-2 py-1.5">
      <p className="font-semibold text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 truncate text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function ConversationDigest({
  onSaveArtifact,
  onCreateTask,
  onPromoteCase,
  onReviewMemory,
  suggestedAgents,
}: {
  onSaveArtifact: () => void;
  onCreateTask: () => void;
  onPromoteCase: () => void;
  onReviewMemory: () => void;
  suggestedAgents: string[];
}) {
  return (
    <section className="mb-3 rounded-[8px] border border-[var(--border-soft)] bg-[var(--surface-soft)] p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-green)]">
          <ClipboardList className="h-4 w-4" />
          Conversation Digest
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Suggested agents: {suggestedAgents.join(", ")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <DigestButton icon={<Save className="h-3.5 w-3.5" />} label="Save as Artifact" onClick={onSaveArtifact} />
        <DigestButton icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Create Task Proposal" onClick={onCreateTask} />
        <DigestButton icon={<FolderKanban className="h-3.5 w-3.5" />} label="Promote to Case" onClick={onPromoteCase} />
        <DigestButton icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Review Memory" onClick={onReviewMemory} />
      </div>
    </section>
  );
}

function DigestButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-green)] hover:bg-[var(--surface-hover)]"
    >
      {icon}
      {label}
    </button>
  );
}

function ActionDraftEditor({
  draft,
  onChange,
  onCancel,
  onStage,
}: {
  draft: ActionDraft;
  onChange: (draft: ActionDraft) => void;
  onCancel: () => void;
  onStage: () => void;
}) {
  return (
    <section className="mb-3 rounded-[8px] border border-[var(--accent-green)] bg-[var(--control-muted)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Review before Agency Queue
        </h3>
        <span className="text-xs text-[var(--text-muted)]">{draft.kind.replaceAll("_", " ")}</span>
      </div>

      <div className="grid gap-3">
        <label className="text-xs font-semibold text-[var(--text-muted)]">
          Title
          <input
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value } as ActionDraft)}
            className="form-control mt-1 w-full px-3 py-2 text-sm"
          />
        </label>

        {draft.kind === "save_artifact" ? (
          <>
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Type
              <input
                value={draft.type}
                onChange={(event) => onChange({ ...draft, type: event.target.value })}
                className="form-control mt-1 w-full px-3 py-2 text-sm"
              />
            </label>
            <DraftTextarea label="Content" value={draft.content} onChange={(content) => onChange({ ...draft, content })} />
          </>
        ) : null}

        {draft.kind === "create_task" ? (
          <DraftTextarea label="Description" value={draft.description} onChange={(description) => onChange({ ...draft, description })} />
        ) : null}

        {draft.kind === "create_case" ? (
          <>
            <DraftTextarea label="Summary" value={draft.summary} onChange={(summary) => onChange({ ...draft, summary })} />
            <DraftTextarea
              label="Task candidates"
              value={draft.taskCandidates.map((task) => task.title).join("\n")}
              onChange={(value) => onChange({
                ...draft,
                taskCandidates: value.split("\n").map((title) => ({ title: title.trim(), description: "" })).filter((task) => task.title),
              })}
            />
            <DraftTextarea
              label="Memory candidates"
              value={draft.memoryCandidates.map((memory) => memory.content).join("\n")}
              onChange={(value) => onChange({
                ...draft,
                memoryCandidates: value.split("\n").map((content) => ({ content: content.trim(), memoryType: "note" })).filter((memory) => memory.content),
              })}
            />
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Suggested agents
              <input
                value={draft.suggestedAgents.join(", ")}
                onChange={(event) => onChange({
                  ...draft,
                  suggestedAgents: event.target.value.split(",").map((agent) => agent.trim()).filter(Boolean),
                })}
                className="form-control mt-1 w-full px-3 py-2 text-sm"
              />
            </label>
          </>
        ) : null}

        {draft.kind === "save_memory" ? (
          <>
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Memory type
              <input
                value={draft.memoryType}
                onChange={(event) => onChange({ ...draft, memoryType: event.target.value })}
                className="form-control mt-1 w-full px-3 py-2 text-sm"
              />
            </label>
            <DraftTextarea label="Memory candidate" value={draft.content} onChange={(content) => onChange({ ...draft, content })} />
          </>
        ) : null}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-8 px-3 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          Cancel
        </button>
        <button type="button" onClick={onStage} className="h-8 rounded-[6px] bg-[var(--accent-green)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--accent-green-hover)]">
          Stage for approval
        </button>
      </div>
    </section>
  );
}

function DraftTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs font-semibold text-[var(--text-muted)]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-control mt-1 min-h-24 w-full resize-y px-3 py-2 text-sm"
      />
    </label>
  );
}

function ActionLedger({ entries }: { entries: LedgerEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <details className="mb-3 rounded-[8px] border border-[var(--border-soft)] bg-[var(--control-muted)] p-3">
      <summary className="cursor-pointer text-xs font-semibold text-[var(--accent-green)]">
        Action Ledger ({entries.length})
      </summary>
      <div className="mt-3 space-y-2">
        {entries.slice(0, 8).map((entry) => (
          <div key={entry.id} className="rounded-[6px] border border-[var(--border-soft)] bg-[var(--control-subtle)] px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[var(--text-primary)]">{entry.title}</p>
              <span className="text-[11px] text-[var(--text-muted)]">{entry.kind}</span>
            </div>
            {entry.detail ? <p className="mt-1 text-xs text-[var(--text-muted)]">{entry.detail}</p> : null}
          </div>
        ))}
      </div>
    </details>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");
  
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [initialCaseId, setInitialCaseId] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setTimeout(() => {
        setInitialMessages([]);
        setInitialCaseId(null);
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
        setInitialCaseId(data.session?.caseId ?? null);
        setSessionLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setInitialMessages([]);
        setInitialCaseId(null);
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

  return <ChatWindow key={chatId || "new"} initialMessages={initialMessages} chatId={chatId} initialCaseId={initialCaseId} />;
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

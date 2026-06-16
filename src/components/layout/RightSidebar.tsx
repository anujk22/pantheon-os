"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MessageSquare, Plus, ShieldCheck, SunMedium } from "lucide-react";

type ChatSummary = {
  id: string;
  title: string | null;
  folder: string | null;
};

type RailEvent = {
  id: string;
  title: string;
  date: string;
  source: string;
};

type RailCase = {
  id: string;
  title: string;
  status: string;
  _count: {
    tasks: number;
    artifacts: number;
    memories: number;
  };
};

type RailState = {
  briefing: { content: string; date: string } | null;
  events: RailEvent[];
  activeCase: RailCase | null;
};

export function RightSidebar() {
  const pathname = usePathname();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [railState, setRailState] = useState<RailState>({
    briefing: null,
    events: [],
    activeCase: null,
  });

  const activeCaseId = pathname.startsWith("/cases/")
    ? pathname.split("/")[2] || null
    : null;

  const fetchChats = () => {
    fetch("/api/chat/history")
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((err) => console.error(err));
  };

  const fetchRailState = useCallback(() => {
    const suffix = activeCaseId ? `?caseId=${encodeURIComponent(activeCaseId)}` : "";
    fetch(`/api/right-rail${suffix}`)
      .then((res) => res.json())
      .then((data: RailState) => setRailState(data))
      .catch((err) => console.error(err));
  }, [activeCaseId]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    fetchRailState();
  }, [fetchRailState]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this chat?")) {
      await fetch(`/api/chat/session/${id}`, { method: "DELETE" });
      fetchChats();
    }
  };

  const handleSetFolder = async (id: string, folder: string | null, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFolder = prompt("Enter folder name (leave empty to clear):", folder || "");
    if (newFolder !== null) {
      await fetch(`/api/chat/session/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: newFolder || null }),
      });
      fetchChats();
    }
  };

  const groupedChats = chats.reduce<Record<string, ChatSummary[]>>((acc, chat) => {
    const folder = chat.folder || "Uncategorized";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(chat);
    return acc;
  }, {});

  return (
    <aside className="hidden h-full w-[328px] shrink-0 flex-col gap-3 overflow-y-auto pb-1 min-[1180px]:flex min-[1500px]:w-[360px] custom-scrollbar">
      <StatusCard
        icon={<MessageSquare className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="RECENT CHATS"
        heading="Command Layer History"
      >
        <Link
          href="/"
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[6px] border border-[var(--accent-green)] bg-[var(--control-muted)] px-3 py-2 text-sm font-semibold text-[var(--accent-green)] transition hover:bg-[var(--accent-green)] hover:text-white"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Link>
        <div className="flex flex-col gap-3">
          {Object.keys(groupedChats).length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No recent chats found.</p>
          ) : (
            Object.keys(groupedChats).map((folder) => (
              <div key={folder} className="flex flex-col gap-1">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 px-1">
                  {folder}
                </h4>
                {groupedChats[folder].map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/?chat=${chat.id}`}
                    className="group relative flex items-center justify-between rounded-[6px] border border-transparent px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--border-soft)] hover:bg-[var(--surface-hover)]"
                  >
                    <span className="truncate pr-4">{chat.title || "New Chat"}</span>
                    <div className="absolute right-2 hidden items-center gap-1 group-hover:flex">
                      <button
                        onClick={(e) => handleSetFolder(chat.id, chat.folder, e)}
                        className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--accent-bronze)]"
                        title="Move to folder"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(chat.id, e)}
                        className="rounded p-1 text-[var(--text-muted)] hover:bg-[#b94d3f]/20 hover:text-[#b94d3f]"
                        title="Delete chat"
                      >
                        <span className="text-[10px] font-bold">X</span>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            ))
          )}
        </div>
      </StatusCard>

      <StatusCard
        icon={<SunMedium className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="MORNING BRIEF"
        heading={railState.briefing ? "Latest saved brief" : "No brief saved"}
      >
        {railState.briefing ? (
          <p className="line-clamp-5">{railState.briefing.content}</p>
        ) : (
          "No Morning Briefing records exist yet. When cadence saves a real brief, it appears here."
        )}
      </StatusCard>

      <StatusCard
        icon={<CalendarDays className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="TODAY'S CALENDAR"
        heading={railState.events.length > 0 ? `${railState.events.length} saved events` : "No events saved today"}
      >
        {railState.events.length > 0 ? (
          <div className="space-y-2">
            {railState.events.map((event) => (
              <div key={event.id} className="flex items-start gap-2">
                <span className="w-14 shrink-0 text-xs font-semibold text-[var(--accent-green)]">
                  {formatTime(event.date)}
                </span>
                <span className="min-w-0 flex-1 text-[var(--text-primary)]">
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          "No local calendar events are saved for today. External calendars should import events here only after a connector is configured."
        )}
      </StatusCard>

      <StatusCard
        icon={<ShieldCheck className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="ACTIVE CASE"
        heading={railState.activeCase ? railState.activeCase.title : "No active case selected"}
      >
        {railState.activeCase ? (
          <Link
            href={`/cases/${railState.activeCase.id}`}
            className="block rounded-[6px] border border-[var(--border-soft)] bg-[var(--control-muted)] p-3 transition hover:border-[var(--accent-green)]"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-green)]">
              {railState.activeCase.status}
            </p>
            <p>
              {railState.activeCase._count.tasks} tasks ·{" "}
              {railState.activeCase._count.artifacts} artifacts ·{" "}
              {railState.activeCase._count.memories} memories
            </p>
          </Link>
        ) : (
          "Cases appear here after you create or triage one from the Inbox."
        )}
      </StatusCard>
    </aside>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusCard({
  icon,
  title,
  heading,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="stone-card architectural-corners p-4">
      <div className="mb-3 flex items-center gap-3 border-b border-[var(--border-soft)] pb-2">
        {icon}
        <h3 className="font-serif text-[0.92rem] font-semibold tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
        {heading}
      </h4>
      <div className="text-sm leading-relaxed text-[var(--text-muted)]">
        {children}
      </div>
    </section>
  );
}

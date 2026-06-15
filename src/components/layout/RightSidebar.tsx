/* eslint-disable */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, MessageSquare, Plus, ShieldCheck, SunMedium } from "lucide-react";

export function RightSidebar() {
  const [chats, setChats] = useState<any[]>([]);

  const fetchChats = () => {
    fetch("/api/chat/history")
      .then((res) => res.json())
      .then((data) => setChats(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchChats();
  }, []);

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

  const groupedChats = chats.reduce((acc: any, chat: any) => {
    const folder = chat.folder || "Uncategorized";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(chat);
    return acc;
  }, {});

  return (
    <aside className="hidden h-full w-[316px] shrink-0 flex-col gap-2 overflow-y-auto pb-1 min-[1180px]:flex min-[1500px]:w-[348px] custom-scrollbar">
      <StatusCard
        icon={<MessageSquare className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="RECENT CHATS"
        heading="Command Layer History"
      >
        <Link
          href="/"
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[6px] border border-[var(--accent-green)] bg-[rgba(255,253,248,0.72)] px-3 py-2 text-sm font-semibold text-[var(--accent-green)] transition hover:bg-[var(--accent-green)] hover:text-white"
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
                {groupedChats[folder].map((chat: any) => (
                  <Link
                    key={chat.id}
                    href={`/?chat=${chat.id}`}
                    className="group relative flex items-center justify-between rounded-[6px] border border-transparent px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-[rgba(174,144,100,0.34)] hover:bg-[rgba(255,255,255,0.5)]"
                  >
                    <span className="truncate pr-4">{chat.title || "New Chat"}</span>
                    <div className="absolute right-2 hidden items-center gap-1 group-hover:flex">
                      <button
                        onClick={(e) => handleSetFolder(chat.id, chat.folder, e)}
                        className="rounded p-1 text-[var(--text-muted)] hover:bg-[rgba(174,144,100,0.2)] hover:text-[var(--accent-bronze)]"
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
        heading="No brief generated"
      >
        Morning briefs are not generated automatically yet. When that workflow is
        connected, this panel will show the latest saved briefing from local storage.
      </StatusCard>

      <StatusCard
        icon={<CalendarDays className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="TODAY'S CALENDAR"
        heading="Calendar not connected"
      >
        No calendar provider is wired into this screen. Connectors should show real
        events here only after an integration is configured.
      </StatusCard>

      <StatusCard
        icon={<ShieldCheck className="h-5 w-5 text-[var(--accent-bronze)]" />}
        title="ACTIVE CASE"
        heading="No active case selected"
      >
        Cases exist only after you create or triage one from the Inbox. This rail will
        stay empty until a real case is active.
      </StatusCard>
    </aside>
  );
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
    <section className="stone-card architectural-corners p-5">
      <div className="mb-4 flex items-center gap-3">
        {icon}
        <h3 className="font-serif text-[1.02rem] font-semibold tracking-[0.16em]">
          {title}
        </h3>
      </div>
      <h4 className="text-base font-semibold text-[var(--text-primary)] mb-2">
        {heading}
      </h4>
      <div className="text-sm leading-relaxed text-[var(--text-muted)]">
        {children}
      </div>
    </section>
  );
}

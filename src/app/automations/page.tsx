import React from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  createEvent,
  deleteEvent,
  generateMorningBrief,
  importIcsCalendar,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [briefing, events, pendingActions, untriagedInbox] = await Promise.all([
    prisma.morningBriefing.findFirst({ orderBy: { date: "desc" } }),
    prisma.event.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      take: 30,
    }),
    prisma.agentAction.count({ where: { status: "pending" } }),
    prisma.inboxItem.count({ where: { status: "untriaged" } }),
  ]);

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-6 flex flex-col gap-4 border-b border-[var(--border-soft)] pb-5 min-[980px]:flex-row min-[980px]:items-end min-[980px]:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            CADENCE
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
            Generate a real local Morning Brief and maintain calendar records used by
            the right rail. Nothing here touches external accounts.
          </p>
        </div>
        <form action={generateMorningBrief}>
          <button
            type="submit"
            className="flex h-10 items-center gap-2 rounded-[7px] bg-[var(--accent-green)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)]"
          >
            <Sparkles className="h-4 w-4" />
            Generate brief
          </button>
        </form>
      </header>

      <section className="relative z-10 mb-5 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
        <Metric label="Upcoming events" value={events.length} />
        <Metric label="Pending actions" value={pendingActions} />
        <Metric label="Inbox waiting" value={untriagedInbox} />
        <Metric label="Brief saved" value={briefing ? 1 : 0} />
      </section>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-h-0 overflow-y-auto pr-1 custom-scrollbar">
          <div className="stone-card architectural-corners mb-5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[var(--accent-bronze)]" />
              <h2 className="font-serif text-xl font-semibold tracking-[0.06em] text-[var(--text-primary)]">
                MORNING BRIEF
              </h2>
            </div>
            {briefing ? (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-green)]">
                  Saved {briefing.date.toLocaleDateString()}
                </p>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
                  {briefing.content}
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                No brief has been saved yet. Generate one to synthesize tasks,
                calendar events, inbox items, active cases, and recent memory.
              </p>
            )}
          </div>

          <div className="stone-card architectural-corners p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[var(--accent-bronze)]" />
              <h2 className="font-serif text-xl font-semibold tracking-[0.06em] text-[var(--text-primary)]">
                UPCOMING EVENTS
              </h2>
            </div>
            {events.length === 0 ? (
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                No local events are saved. Add meetings, deadlines, or focus blocks
                here so the right rail and Morning Brief have real schedule context.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--control-muted)] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-green)]">
                          {formatDateTime(event.date)}
                        </p>
                        <h3 className="mt-1 font-semibold text-[var(--text-primary)]">
                          {event.title}
                        </h3>
                        {event.description ? (
                          <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                            {event.description}
                          </p>
                        ) : null}
                      </div>
                      <form action={deleteEvent}>
                        <input type="hidden" name="id" value={event.id} />
                        <button
                          type="submit"
                          className="grid h-8 w-8 place-items-center rounded-[6px] text-[var(--text-muted)] transition hover:bg-[#b94d3f]/20 hover:text-[#b94d3f]"
                          aria-label={`Delete ${event.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="stone-card architectural-corners h-fit p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[var(--accent-bronze)]" />
            <h2 className="font-serif text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]">
              ADD EVENT
            </h2>
          </div>
          <form action={createEvent} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Title
              </span>
              <input
                name="title"
                required
                className="form-control w-full px-3 py-2 text-sm"
                placeholder="Strategy sync"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Date and time
              </span>
              <input
                name="date"
                type="datetime-local"
                required
                className="form-control w-full px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Notes
              </span>
              <textarea
                name="description"
                className="form-control min-h-[96px] w-full resize-y px-3 py-2 text-sm"
                placeholder="Agenda, context, or why this matters"
              />
            </label>
            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border-soft)] bg-[var(--control-muted)] text-sm font-semibold text-[var(--accent-green)] transition hover:border-[var(--accent-green)] hover:bg-[var(--control)]"
            >
              <Clock3 className="h-4 w-4" />
              Save local event
            </button>
          </form>

          <div className="my-5 h-px bg-[var(--border-soft)]" />

          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[var(--accent-bronze)]" />
            <h2 className="font-serif text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]">
              IMPORT ICS
            </h2>
          </div>
          <form action={importIcsCalendar} className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Calendar URL
              </span>
              <input
                name="icsUrl"
                type="url"
                required
                className="form-control w-full px-3 py-2 text-sm"
                placeholder="https://calendar.google.com/calendar/ical/..."
              />
            </label>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Imports events in the next 60 days into the local calendar store.
            </p>
            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border-soft)] bg-[var(--control-muted)] text-sm font-semibold text-[var(--accent-green)] transition hover:border-[var(--accent-green)] hover:bg-[var(--control)]"
            >
              <CalendarDays className="h-4 w-4" />
              Import events
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="stone-card px-4 py-3">
      <p className="text-2xl font-semibold text-[var(--accent-green)]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function formatDateTime(date: Date) {
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

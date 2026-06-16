import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";
import {
  Archive,
  Brain,
  Briefcase,
  CheckSquare,
  FileText,
  Inbox,
  Plus,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { classifyInboxText, titleFromBody } from "@/lib/inbox";

export const dynamic = "force-dynamic";

export default async function CommandInboxPage() {
  const [items, cases] = await Promise.all([
    prisma.inboxItem.findMany({
      include: { case: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.case.findMany({
      where: { status: "active" },
      orderBy: { updatedAt: "desc" },
      take: 30,
    }),
  ]);

  const sortedItems = [...items].sort((a, b) => {
    if (a.status === b.status) return b.createdAt.getTime() - a.createdAt.getTime();
    if (a.status === "untriaged") return -1;
    if (b.status === "untriaged") return 1;
    if (a.status === "triaged") return -1;
    return 1;
  });

  const untriagedCount = items.filter((item) => item.status === "untriaged").length;
  const triagedCount = items.filter((item) => item.status === "triaged").length;
  const archivedCount = items.filter((item) => item.status === "archived").length;

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden">
      <header className="relative z-10 border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-7 py-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--accent-green)] text-white">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-[var(--text-primary)]">
                  Command Inbox
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Capture first. Triage before memory.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center min-w-[260px]">
            <Metric label="Untriaged" value={untriagedCount} />
            <Metric label="Triaged" value={triagedCount} />
            <Metric label="Archived" value={archivedCount} />
          </div>
        </div>

        <form action={captureInboxItem} className="mt-5 flex items-center gap-3">
          <input
            name="body"
            required
            minLength={2}
            placeholder="Capture a note, imported context, loose task, or idea..."
            className="form-control min-w-0 flex-1 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border-soft)] bg-[var(--accent-green)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-green-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]"
          >
            <Plus className="w-4 h-4" />
            Capture
          </button>
        </form>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto p-5 custom-scrollbar">
        {sortedItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-md">
              <h2 className="font-serif text-2xl text-[var(--text-primary)]">Inbox is clear</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Add a manual capture above. Imported chats, files, calendars, and Codex
                summaries should land here before they become durable memory.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <article
                key={item.id}
                className="stone-card overflow-hidden"
              >
                <div className="p-5 flex gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge>{item.sourceType}</Badge>
                      <DestinationBadge destination={item.suggestedDestination} />
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatDate(item.createdAt)}
                      </span>
                      {item.case ? (
                        <span className="text-xs text-[var(--accent-green)]">
                          Case: {item.case.title}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="font-serif text-xl font-bold leading-tight text-[var(--text-primary)]">
                      {item.title}
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
                      {item.body}
                    </p>
                    {typeof item.confidence === "number" ? (
                      <p className="mt-3 text-xs text-[var(--text-muted)]">
                        Local classifier confidence: {Math.round(item.confidence * 100)}%
                      </p>
                    ) : null}
                  </div>

                  <div className="w-[360px] shrink-0 border-l border-[var(--border-soft)] pl-5">
                    <div className="grid grid-cols-2 gap-2">
                      <TriageButton
                        itemId={item.id}
                        destination="task"
                        icon={<CheckSquare className="w-4 h-4" />}
                      >
                        Create Task
                      </TriageButton>
                      <TriageButton
                        itemId={item.id}
                        destination="artifact"
                        icon={<FileText className="w-4 h-4" />}
                      >
                        Save Artifact
                      </TriageButton>
                      <TriageButton
                        itemId={item.id}
                        destination="memory"
                        icon={<Brain className="w-4 h-4" />}
                      >
                        Save Memory
                      </TriageButton>
                      <TriageButton
                        itemId={item.id}
                        destination="archive"
                        icon={<Archive className="w-4 h-4" />}
                      >
                        Archive
                      </TriageButton>
                    </div>

                    <form action={triageInboxItem} className="mt-3 flex gap-2">
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="destination" value="case" />
                      <select
                        name="caseId"
                        aria-label="Case destination"
                        className="form-control min-w-0 flex-1 px-3 py-2 text-xs"
                        defaultValue={item.caseId ?? ""}
                      >
                        <option value="">New case from item</option>
                        {cases.map((caseItem) => (
                          <option key={caseItem.id} value={caseItem.id}>
                            {caseItem.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-lg border border-[var(--border-stone)] bg-[var(--control)] px-3 py-2 text-xs font-semibold text-[var(--accent-green)] hover:border-[var(--accent-green)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]"
                      >
                        <Briefcase className="w-4 h-4" />
                        Attach
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function captureInboxItem(formData: FormData) {
  "use server";

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const classification = classifyInboxText(body);

  await prisma.inboxItem.create({
    data: {
      title: titleFromBody(body),
      body,
      sourceType: "manual",
      status: "untriaged",
      suggestedDestination: classification.destination,
      confidence: classification.confidence,
    },
  });

  revalidatePath("/inbox");
}

async function triageInboxItem(formData: FormData) {
  "use server";

  const itemId = String(formData.get("itemId") ?? "");
  const destination = String(formData.get("destination") ?? "");
  const caseId = String(formData.get("caseId") ?? "");
  if (!itemId) return;

  const item = await prisma.inboxItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  const now = new Date();
  const linkedCaseId = caseId || item.caseId;

  if (destination === "task") {
    await prisma.task.create({
      data: {
        title: item.title,
        description: item.body,
        caseId: linkedCaseId || undefined,
        sourceInboxItemId: item.id,
      },
    });
  }

  if (destination === "artifact") {
    await prisma.artifact.create({
      data: {
        title: item.title,
        type: "text",
        content: item.body,
        caseId: linkedCaseId || undefined,
        sourceInboxItemId: item.id,
      },
    });
  }

  if (destination === "memory") {
    await prisma.memory.create({
      data: {
        content: item.body,
        memoryType: item.suggestedDestination === "memory" ? "preference" : "note",
        sourceType: item.sourceType,
        sourceRef: item.sourceRef,
        confidence: item.confidence,
        caseId: linkedCaseId || undefined,
        sourceInboxItemId: item.id,
      },
    });
  }

  if (destination === "case") {
    const targetCaseId =
      caseId ||
      (
        await prisma.case.create({
          data: {
            title: item.title,
            description: item.body,
          },
        })
      ).id;

    await prisma.inboxItem.update({
      where: { id: item.id },
      data: {
        caseId: targetCaseId,
        status: "triaged",
        suggestedDestination: "case",
        triagedAt: now,
      },
    });
    revalidatePath("/inbox");
    revalidatePath("/cases");
    return;
  }

  await prisma.inboxItem.update({
    where: { id: item.id },
    data: {
      status: destination === "archive" ? "archived" : "triaged",
      suggestedDestination: destination,
      triagedAt: now,
    },
  });

  revalidatePath("/inbox");
  revalidatePath("/artifacts");
  revalidatePath("/vault");
  revalidatePath("/cases");
}

function TriageButton({
  itemId,
  destination,
  icon,
  children,
}: {
  itemId: string;
  destination: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <form action={triageInboxItem}>
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="destination" value={destination} />
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-stone)] bg-[var(--control)] px-3 py-2 text-xs font-semibold text-[var(--accent-green)] hover:border-[var(--accent-green)] hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]"
      >
        {icon}
        {children}
      </button>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--control-muted)] px-3 py-2">
      <p className="text-lg font-bold leading-none text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-[10px] text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--border-soft)] bg-[var(--control-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
      {children}
    </span>
  );
}

function DestinationBadge({ destination }: { destination: string }) {
  return (
    <span className="rounded-full border border-[var(--border-soft)] bg-[var(--control-muted)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--accent-green)]">
      Suggested: {destination}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "untriaged"
      ? "success-badge"
      : status === "archived"
        ? "border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--text-muted)]"
        : "border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--accent-green)]";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tone}`}>
      {status}
    </span>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

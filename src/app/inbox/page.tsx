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
    <div className="h-full w-full flex flex-col bg-white/55 border border-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
      <header className="px-7 py-5 border-b border-white/80 bg-white/45">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1B3B2B] text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/40">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#1a1f1c]">
                  Command Inbox
                </h1>
                <p className="text-sm text-[#4A5D53] mt-1">
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
            className="min-w-0 flex-1 rounded-xl border border-[#D8D8D0] bg-white px-4 py-3 text-sm text-[#1a1f1c] placeholder:text-[#5A6960] outline-none focus:border-[#1B3B2B] focus:ring-2 focus:ring-[#1B3B2B]/15"
          />
          <button
            type="submit"
            className="h-11 px-4 rounded-xl bg-[#1B3B2B] text-white text-sm font-semibold border border-[#D4AF37]/40 hover:bg-[#142A1E] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Capture
          </button>
        </form>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        {sortedItems.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-md">
              <h2 className="font-serif text-2xl text-[#1a1f1c]">Inbox is clear</h2>
              <p className="text-sm text-[#4A5D53] mt-2">
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
                className="rounded-xl border border-white bg-white/80 shadow-sm overflow-hidden"
              >
                <div className="p-5 flex gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge>{item.sourceType}</Badge>
                      <DestinationBadge destination={item.suggestedDestination} />
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-[#5A6960]">
                        {formatDate(item.createdAt)}
                      </span>
                      {item.case ? (
                        <span className="text-xs text-[#1B3B2B]">
                          Case: {item.case.title}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="font-serif text-xl font-bold text-[#1a1f1c] leading-tight">
                      {item.title}
                    </h2>
                    <p className="text-sm text-[#34433B] mt-2 leading-relaxed whitespace-pre-wrap">
                      {item.body}
                    </p>
                    {typeof item.confidence === "number" ? (
                      <p className="text-xs text-[#5A6960] mt-3">
                        Local classifier confidence: {Math.round(item.confidence * 100)}%
                      </p>
                    ) : null}
                  </div>

                  <div className="w-[360px] shrink-0 border-l border-gray-100 pl-5">
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
                        className="min-w-0 flex-1 rounded-lg border border-[#D8D8D0] bg-white px-3 py-2 text-xs text-[#1a1f1c] outline-none focus:border-[#1B3B2B]"
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
                        className="rounded-lg border border-[#D8D8D0] bg-white px-3 py-2 text-xs font-semibold text-[#1B3B2B] hover:border-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/15 flex items-center gap-1"
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
        className="w-full rounded-lg border border-[#D8D8D0] bg-white px-3 py-2 text-xs font-semibold text-[#1B3B2B] hover:border-[#1B3B2B] hover:bg-[#F4F4F0] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/15 flex items-center justify-center gap-2"
      >
        {icon}
        {children}
      </button>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white bg-white/70 px-3 py-2">
      <p className="text-lg font-bold text-[#1a1f1c] leading-none">{value}</p>
      <p className="text-[10px] text-[#5A6960] mt-1">{label}</p>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#D8D8D0] bg-[#F4F4F0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4A5D53]">
      {children}
    </span>
  );
}

function DestinationBadge({ destination }: { destination: string }) {
  return (
    <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1B3B2B]">
      Suggested: {destination}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "untriaged"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "archived"
        ? "border-gray-200 bg-gray-50 text-gray-600"
        : "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#1B3B2B]";

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

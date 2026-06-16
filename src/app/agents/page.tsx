import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  Play,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  executeAction,
  executeAllPendingActions,
  generateAgentActions,
  rejectAction,
} from "./actions";

export const dynamic = "force-dynamic";

type AgentActionRecord = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  status: string;
  sourceType: string;
  sourceRef: string | null;
  payloadJson: string;
  resultJson: string | null;
  error: string | null;
  createdBy: string;
  createdAt: Date;
  executedAt: Date | null;
};

export default async function AgentsPage() {
  const [actions, inboxCount, chatCount] = await Promise.all([
    prisma.agentAction.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 120,
    }),
    prisma.inboxItem.count({ where: { status: "untriaged" } }),
    prisma.chatSession.count({ where: { isSummarized: false } }),
  ]);

  const pending = actions.filter((action) => action.status === "pending");
  const executed = actions.filter((action) => action.status === "executed");
  const failed = actions.filter((action) => action.status === "failed");
  const rejected = actions.filter((action) => action.status === "rejected");

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-6 flex flex-col gap-5 border-b border-[var(--border-soft)] pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-[7px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-green)]">
            <ShieldCheck className="h-4 w-4" />
            Bounded local agency
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            AGENCY QUEUE
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
            Athena proposes actions from local context. Pantheon executes only reviewed,
            local mutations and keeps every result in this ledger.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={generateAgentActions}>
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-[7px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-4 text-sm font-semibold text-[var(--accent-green)] transition hover:border-[var(--accent-green)] hover:bg-[var(--control)]"
            >
              <Sparkles className="h-4 w-4" />
              Generate proposals
            </button>
          </form>
          <form action={executeAllPendingActions}>
            <button
              type="submit"
              disabled={pending.length === 0}
              className="flex h-10 items-center gap-2 rounded-[7px] bg-[var(--accent-green)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Execute safe pending
            </button>
          </form>
        </div>
      </header>

      <section className="relative z-10 mb-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Metric label="Pending" value={pending.length} tone="green" />
        <Metric label="Executed" value={executed.length} />
        <Metric label="Failed" value={failed.length} tone="red" />
        <Metric label="Rejected" value={rejected.length} />
        <Metric label="Inbox waiting" value={inboxCount} />
        <Metric label="Chats unsummarized" value={chatCount} />
      </section>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          {actions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {actions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          )}
        </section>

        <aside className="stone-card architectural-corners hidden min-h-0 overflow-hidden p-5 xl:block">
          <h2 className="mb-3 font-serif text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            EXECUTION POLICY
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
            <PolicyItem
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Local only"
              body="This queue only executes writes to Pantheon's local database."
            />
            <PolicyItem
              icon={<ListChecks className="h-4 w-4" />}
              title="Reviewable"
              body="Every action keeps its source, payload, status, result, and error."
            />
            <PolicyItem
              icon={<AlertTriangle className="h-4 w-4" />}
              title="External draft-only"
              body="Email, calendar, browser, and connector actions should stay pending until scoped permissions exist."
            />
            <PolicyItem
              icon={<RefreshCcw className="h-4 w-4" />}
              title="Next layer"
              body="Hermes or OpenClaw can plug in here as actuators after Pantheon owns approvals and logging."
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ActionCard({ action }: { action: AgentActionRecord }) {
  const payload = parseJson(action.payloadJson);
  const result = action.resultJson ? parseJson(action.resultJson) : null;
  const isPending = action.status === "pending" || action.status === "failed";

  return (
    <article className="stone-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={action.status} />
            <span className="rounded-[5px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-2 py-1 text-xs font-semibold text-[var(--text-muted)]">
              {labelKind(action.kind)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {action.sourceType}
              {action.sourceRef ? `:${action.sourceRef.slice(0, 8)}` : ""}
            </span>
          </div>
          <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
            {action.title}
          </h2>
          {action.description ? (
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {action.description}
            </p>
          ) : null}
        </div>

        {isPending ? (
          <div className="flex shrink-0 gap-2">
            <form action={executeAction}>
              <input type="hidden" name="id" value={action.id} />
              <button
                type="submit"
                className="flex h-9 items-center gap-2 rounded-[7px] bg-[var(--accent-green)] px-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-green-hover)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Execute
              </button>
            </form>
            <form action={rejectAction}>
              <input type="hidden" name="id" value={action.id} />
              <button
                type="submit"
                className="danger-callout flex h-9 items-center gap-2 rounded-[7px] px-3 text-sm font-semibold transition hover:bg-[var(--control)]"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <JsonBlock title="Payload" value={payload} />
        <JsonBlock
          title={action.error ? "Error" : "Result"}
          value={action.error ? { error: action.error } : result || { state: "Not executed" }}
        />
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "green" | "red";
}) {
  const color =
    tone === "green"
      ? "text-[var(--accent-green)]"
      : tone === "red"
        ? "text-[var(--danger-text)]"
        : "text-[var(--text-primary)]";

  return (
    <div className="stone-card px-4 py-3">
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const icon =
    status === "executed" ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : status === "failed" ? (
      <AlertTriangle className="h-3.5 w-3.5" />
    ) : status === "rejected" ? (
      <Archive className="h-3.5 w-3.5" />
    ) : (
      <Clock3 className="h-3.5 w-3.5" />
    );

  return (
    <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-[var(--border-soft)] bg-[var(--control-muted)] px-2 py-1 text-xs font-semibold capitalize text-[var(--accent-green)]">
      {icon}
      {status}
    </span>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--control-muted)] p-3">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
        <FileText className="h-3.5 w-3.5" />
        {title}
      </h3>
      <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-[var(--text-primary)] custom-scrollbar">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function PolicyItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-[var(--accent-green)]">{icon}</span>
      <span>
        <strong className="block text-[var(--text-primary)]">{title}</strong>
        {body}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[360px] items-center justify-center text-center">
      <div className="max-w-md">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-[var(--accent-green)]" />
        <h2 className="font-serif text-2xl text-[var(--text-primary)]">
          No proposed actions yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Generate proposals to let Athena scan your untriaged inbox and recent
          unsummarized chats for safe local actions.
        </p>
      </div>
    </div>
  );
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return { raw: value };
  }
}

function labelKind(kind: string) {
  return kind.replaceAll("_", " ");
}

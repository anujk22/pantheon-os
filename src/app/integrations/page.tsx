import React from "react";
import {
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Code2,
  Database,
  FileClock,
  FileText,
  GitPullRequest,
  GraduationCap,
  Inbox,
  KeyRound,
  Mail,
  MousePointer2,
  PlugZap,
  ShieldCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Connector = {
  name: string;
  description: string;
  status: "working" | "scaffolded" | "planned" | "recommended";
  value: string;
  nextStep: string;
  icon: React.ComponentType<{ className?: string }>;
};

const plannedConnectors: Connector[] = [
  {
    name: "Canvas LMS",
    description: "Imports assignments, syllabi, due dates, and course files into Inbox.",
    status: "scaffolded",
    value: "Feeds Morning Brief and creates task proposals before deadlines sneak up.",
    nextStep: "Add token storage, course selection, and a scheduled sync job.",
    icon: GraduationCap,
  },
  {
    name: "Calendar",
    description: "Reads the day ahead and blocks focus time from approved actions.",
    status: "planned",
    value: "Makes the right rail and Morning Brief reflect your actual schedule.",
    nextStep: "Connect Google Calendar or local ICS first, write events only through Agency Queue.",
    icon: CalendarDays,
  },
  {
    name: "Mail / Messages Inbox",
    description: "Captures receipts, commitments, links, and follow-ups for triage.",
    status: "planned",
    value: "Turns scattered obligations into reviewed tasks, cases, or memories.",
    nextStep: "Start read-only with sender allowlists and attachment capture.",
    icon: Mail,
  },
  {
    name: "GitHub",
    description: "Pulls repositories, issues, PRs, and release notes into project cases.",
    status: "planned",
    value: "Lets a case understand code work without pasting context manually.",
    nextStep: "Start with repo indexing and issue import, then add PR draft actions.",
    icon: GitPullRequest,
  },
  {
    name: "Local File Watcher",
    description: "Watches selected folders and proposes new artifacts from changed files.",
    status: "recommended",
    value: "Makes Pantheon aware of documents, screenshots, exports, and project files.",
    nextStep: "Add folder scopes and per-file review before anything enters memory.",
    icon: FileClock,
  },
  {
    name: "Hermes Executor",
    description: "Runs approved local actions: create files, draft emails, update tasks, invoke scripts.",
    status: "recommended",
    value: "Gives the Agency Queue real hands while keeping approvals auditable.",
    nextStep: "Implement a local tool registry with dry-run previews and permission scopes.",
    icon: PlugZap,
  },
  {
    name: "OpenClaw Browser Worker",
    description: "Uses a controlled browser session for web research and form-prep workflows.",
    status: "recommended",
    value: "Handles browser chores without giving it unbounded account access.",
    nextStep: "Draft-only by default, require confirmation before submitting forms.",
    icon: MousePointer2,
  },
  {
    name: "Linear / Task Systems",
    description: "Reads external issues and mirrors approved Pantheon tasks outward.",
    status: "planned",
    value: "Keeps cases aligned with where teammates already track work.",
    nextStep: "Read-only import first, then approve-to-create issue actions.",
    icon: Code2,
  },
];

export default async function IntegrationsPage() {
  const [user, eventCount] = await Promise.all([
    prisma.user.findFirst({
      where: { email: "local-admin@pantheon.local" },
      select: { llmProvider: true, llmBaseUrl: true, llmModel: true },
    }),
    prisma.event.count(),
  ]);

  const localConnectors: Connector[] = [
    {
      name: "LLM Endpoint",
      description: "Powers Command Layer and Case Intelligence through your configured model.",
      status: user?.llmBaseUrl ? "working" : "scaffolded",
      value: user?.llmBaseUrl
        ? `${user.llmProvider || "lmstudio"} ${user.llmModel ? `using ${user.llmModel}` : "model configured"}`
        : "Settings exist, but no endpoint is saved yet.",
      nextStep: "Use Settings to test and save a reachable local or hosted endpoint.",
      icon: Bot,
    },
    {
      name: "SQLite Data Lake",
      description: "Stores cases, inbox items, artifacts, memory, chats, and action history locally.",
      status: "working",
      value: "The app already persists durable records instead of hiding them in chat state.",
      nextStep: "Add export, backup, and schema migration workflows.",
      icon: Database,
    },
    {
      name: "Agency Queue",
      description: "Reviews proposed local actions before they mutate tasks, cases, memory, or artifacts.",
      status: "working",
      value: "This is the backbone for real agency without silent side effects.",
      nextStep: "Add per-connector permissions and dry-run previews.",
      icon: ShieldCheck,
    },
    {
      name: "Inbox Triage",
      description: "Captures loose context and routes it into tasks, cases, artifacts, memory, or archive.",
      status: "working",
      value: "Keeps memory reviewable and prevents accidental permanent context.",
      nextStep: "Let connectors write only into Inbox until reviewed.",
      icon: Inbox,
    },
    {
      name: "Local Calendar Store",
      description: "Stores dated events for the right rail and Morning Brief without pretending an external calendar is connected.",
      status: "working",
      value: `${eventCount} local event${eventCount === 1 ? "" : "s"} saved.`,
      nextStep: "Import Google Calendar or ICS events into this table only after a connector is configured.",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-7 flex flex-col gap-5 min-[980px]:flex-row min-[980px]:items-end min-[980px]:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            INTEGRATIONS
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
            This page now separates real local capabilities from planned plugins. No
            fake OAuth switches, no pretend ingestion.
          </p>
        </div>
        <div className="soft-surface rounded-[10px] px-4 py-3 text-sm text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">Rule:</span>{" "}
          external tools draft or import first, Agency Queue approves writes.
        </div>
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <section className="mb-8">
          <SectionTitle
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Working Local Layer"
            description="These capabilities are backed by the current app or database."
          />
          <ConnectorGrid connectors={localConnectors} />
        </section>

        <section>
          <SectionTitle
            icon={<BrainCircuit className="h-5 w-5" />}
            title="Useful Plugins To Add"
            description="The next connectors should increase agency, not just add logos."
          />
          <ConnectorGrid connectors={plannedConnectors} />
        </section>

        <section className="mt-8 grid gap-4 min-[980px]:grid-cols-3">
          <Principle
            icon={<KeyRound className="h-5 w-5" />}
            title="Scoped Permissions"
            text="Each plugin should declare read, draft, and write scopes before Athena can use it."
          />
          <Principle
            icon={<FileText className="h-5 w-5" />}
            title="Dry Runs"
            text="Anything that changes external state should preview the exact action first."
          />
          <Principle
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Action Ledger"
            text="Every plugin action should leave a persisted record in Agency Queue."
          />
        </section>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--accent-green)]">
        {icon}
      </div>
      <div>
        <h2 className="font-serif text-xl font-semibold tracking-[0.06em] text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
      </div>
    </div>
  );
}

function ConnectorGrid({ connectors }: { connectors: Connector[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2 min-[1500px]:grid-cols-4">
      {connectors.map((connector) => (
        <ConnectorCard key={connector.name} connector={connector} />
      ))}
    </div>
  );
}

function ConnectorCard({ connector }: { connector: Connector }) {
  const Icon = connector.icon;

  return (
    <article className="stone-card architectural-corners flex min-h-[244px] flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[8px] border border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--accent-bronze)]">
          <Icon className="h-5 w-5" />
        </div>
        <StatusPill status={connector.status} />
      </div>
      <h3 className="font-serif text-lg font-semibold text-[var(--text-primary)]">
        {connector.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        {connector.description}
      </p>
      <div className="mt-4 space-y-3 border-t border-[var(--border-soft)] pt-4 text-sm">
        <p className="text-[var(--text-primary)]">{connector.value}</p>
        <p className="text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--accent-green)]">Next:</span>{" "}
          {connector.nextStep}
        </p>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: Connector["status"] }) {
  const label = {
    working: "Working",
    scaffolded: "Scaffolded",
    planned: "Planned",
    recommended: "Recommended",
  }[status];

  const className =
    status === "working"
      ? "success-badge"
      : status === "recommended"
        ? "border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--accent-bronze)]"
        : "border-[var(--border-soft)] bg-[var(--control-muted)] text-[var(--text-muted)]";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${className}`}>
      {label}
    </span>
  );
}

function Principle({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="soft-surface rounded-[10px] p-4">
      <div className="mb-2 flex items-center gap-2 text-[var(--accent-green)]">
        {icon}
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{text}</p>
    </div>
  );
}

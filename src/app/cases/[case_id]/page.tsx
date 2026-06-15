import React from "react";
import { notFound } from "next/navigation";
import { FolderKanban, MessageSquareOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CaseChat from "./CaseChat";

export const dynamic = "force-dynamic";

export default async function CaseWorkspacePage({
  params,
}: {
  params: Promise<{ case_id: string }>;
}) {
  const caseId = (await params).case_id;
  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      tasks: { orderBy: { updatedAt: "desc" } },
      artifacts: { orderBy: { updatedAt: "desc" }, take: 20 },
      memories: { orderBy: { updatedAt: "desc" }, take: 20 },
    },
  });

  if (!caseItem) notFound();

  const tasksByStatus = {
    todo: caseItem.tasks.filter((task) => task.status === "todo"),
    in_progress: caseItem.tasks.filter((task) => task.status === "in_progress"),
    done: caseItem.tasks.filter((task) => task.status === "done"),
  };

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden">
      <header className="relative z-10 border-b border-[rgba(174,144,100,0.18)] p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[8px] border border-[rgba(174,144,100,0.28)] bg-[rgba(255,253,248,0.66)]">
            <FolderKanban className="h-6 w-6 text-[var(--accent-green)]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
              {caseItem.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Case status: {caseItem.status}
            </p>
          </div>
        </div>
        {caseItem.description ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
            {caseItem.description}
          </p>
        ) : null}
      </header>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto p-6 custom-scrollbar xl:grid-cols-[340px_1fr]">
        <aside className="w-full xl:w-[340px] shrink-0">
          <CaseChat caseId={caseItem.id} />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]">
              TASKS
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {caseItem.tasks.length} saved tasks
            </p>
          </div>

          {caseItem.tasks.length === 0 ? (
            <div className="stone-card p-8 text-center">
              <h3 className="font-serif text-xl text-[var(--text-primary)]">
                No tasks saved for this case
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Tasks appear here only after they are created from Inbox triage or a
                real task workflow.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <TaskColumn title="To Do" tasks={tasksByStatus.todo} />
              <TaskColumn title="In Progress" tasks={tasksByStatus.in_progress} />
              <TaskColumn title="Done" tasks={tasksByStatus.done} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TaskColumn({
  title,
  tasks,
}: {
  title: string;
  tasks: Array<{ id: string; title: string; description: string | null }>;
}) {
  return (
    <div className="stone-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        <span className="text-xs text-[var(--text-muted)]">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="rounded-[8px] border border-dashed border-[rgba(174,144,100,0.28)] p-4 text-sm text-[var(--text-muted)]">
          No tasks.
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-[8px] border border-[rgba(174,144,100,0.22)] bg-[rgba(255,253,248,0.58)] p-3"
            >
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                {task.title}
              </h4>
              {task.description ? (
                <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                  {task.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

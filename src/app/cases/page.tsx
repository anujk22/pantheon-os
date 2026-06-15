import React from "react";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CreateCaseButton from "./CreateCaseButton";

export const dynamic = "force-dynamic";

export default async function CasesIndexPage() {
  const cases = await prisma.case.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { tasks: true, artifacts: true, memories: true },
      },
    },
    take: 100,
  });

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden p-6">
      <header className="relative z-10 mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-[0.08em] text-[var(--text-primary)]">
            CASES
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Real local workspaces created from triaged inbox items.
          </p>
        </div>
        <CreateCaseButton />
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        {cases.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md">
              <FolderKanban className="mx-auto mb-4 h-10 w-10 text-[var(--accent-green)]" />
              <h2 className="font-serif text-2xl text-[var(--text-primary)]">
                No cases yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                Create a case by capturing something in the Inbox, then triaging it to
                a case. You can also create one manually.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cases.map((caseItem) => (
              <Link href={`/cases/${caseItem.id}`} key={caseItem.id}>
                <article className="stone-card p-5 transition hover:border-[var(--accent-green)]">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-[8px] border border-[rgba(174,144,100,0.28)] bg-[rgba(255,253,248,0.66)]">
                      <FolderKanban className="h-5 w-5 text-[var(--accent-green)]" />
                    </div>
                    <span className="rounded-[5px] border border-[rgba(174,144,100,0.28)] bg-[rgba(255,253,248,0.72)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-green)]">
                      {caseItem.status}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                    {caseItem.title}
                  </h2>
                  {caseItem.description ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {caseItem.description}
                    </p>
                  ) : null}
                  <p className="mt-4 text-xs font-medium tracking-[0.12em] text-[var(--text-muted)]">
                    {caseItem._count.tasks} TASKS · {caseItem._count.artifacts} ARTIFACTS ·{" "}
                    {caseItem._count.memories} MEMORIES
                  </p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

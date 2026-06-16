import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 8,
      },
      _count: {
        select: { messages: true },
      },
    },
    take: 20,
  });

  const totalMessages = sessions.reduce(
    (count, session) => count + session._count.messages,
    0
  );

  return (
    <div className="stone-panel architectural-corners flex h-full w-full flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-8 py-6">
        <div>
          <h1 className="font-serif text-3xl text-[var(--text-primary)]">Chat Memory</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {sessions.length} sessions · {totalMessages} persisted messages
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold tracking-widest text-[var(--accent-bronze)] uppercase">
            SQLite
          </p>
          <p className="text-xs text-[var(--text-muted)]">Local transcript store</p>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto p-6 custom-scrollbar">
        {sessions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text-primary)]">
                No persisted conversations
              </h2>
              <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
                Start a conversation in Command Layer and completed turns will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="stone-card overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                      {session.title}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {session._count.messages} messages · Updated{" "}
                      {formatDate(session.updatedAt)}
                    </p>
                  </div>
                  <span className="success-badge rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                    {session.isSummarized ? "Summarized" : "Raw"}
                  </span>
                </div>

                <div className="divide-y divide-[var(--border-soft)]">
                  {session.summary ? (
                    <div className="px-5 py-4">
                      <p className="mb-2 text-[10px] font-bold tracking-widest text-[var(--accent-bronze)] uppercase">
                        Summary
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                        {session.summary}
                      </p>
                    </div>
                  ) : null}

                  {session.messages.map((message) => (
                    <div key={message.id} className="px-5 py-3">
                      <div className="flex items-start gap-3">
                        <span className="w-20 shrink-0 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
                          {message.role}
                        </span>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
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

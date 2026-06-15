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
    <div className="h-full w-full flex flex-col bg-white/40 backdrop-blur-md rounded-2xl border border-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
      <header className="px-8 py-6 border-b border-white/70 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-[#1a1f1c]">Chat Memory</h1>
          <p className="text-sm text-[#4A5D53] mt-1">
            {sessions.length} sessions · {totalMessages} persisted messages
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
            SQLite
          </p>
          <p className="text-xs text-[#4A5D53]">Local transcript store</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {sessions.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <h2 className="font-serif text-2xl text-[#1a1f1c]">
                No persisted conversations
              </h2>
              <p className="text-sm text-[#4A5D53] mt-2 max-w-md">
                Start a conversation in Mission Control and completed turns will
                appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="bg-white/70 border border-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1a1f1c]">
                      {session.title}
                    </h2>
                    <p className="text-xs text-[#4A5D53] mt-1">
                      {session._count.messages} messages · Updated{" "}
                      {formatDate(session.updatedAt)}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 font-bold">
                    {session.isSummarized ? "Summarized" : "Raw"}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {session.summary ? (
                    <div className="px-5 py-4">
                      <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold mb-2">
                        Summary
                      </p>
                      <p className="text-sm text-[#1a1f1c] leading-relaxed">
                        {session.summary}
                      </p>
                    </div>
                  ) : null}

                  {session.messages.map((message) => (
                    <div key={message.id} className="px-5 py-3">
                      <div className="flex items-start gap-3">
                        <span className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-[#4A5D53] font-bold">
                          {message.role}
                        </span>
                        <p className="text-sm text-[#1a1f1c] leading-relaxed whitespace-pre-wrap">
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

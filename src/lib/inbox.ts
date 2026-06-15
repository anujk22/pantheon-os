export type InboxDestination =
  | "task"
  | "case"
  | "artifact"
  | "memory"
  | "archive"
  | "unknown";

export function classifyInboxText(text: string): {
  destination: InboxDestination;
  confidence: number;
} {
  const normalized = text.toLowerCase();

  if (
    /\b(deadline|due|submit|finish|apply|complete|todo|to-do|remind|schedule)\b/.test(
      normalized
    )
  ) {
    return { destination: "task", confidence: 0.78 };
  }

  if (/\b(project|hackathon|app|build|repo|repository|launch|prototype)\b/.test(normalized)) {
    return { destination: "case", confidence: 0.7 };
  }

  if (/\b(file|screenshot|pdf|image|resume|script|document|docx|csv|upload)\b/.test(normalized)) {
    return { destination: "artifact", confidence: 0.74 };
  }

  if (
    /\b(i prefer|i like|i dislike|always|never|my default|remember that|recurring|usually)\b/.test(
      normalized
    )
  ) {
    return { destination: "memory", confidence: 0.72 };
  }

  if (normalized.trim().length < 12) {
    return { destination: "unknown", confidence: 0.2 };
  }

  return { destination: "unknown", confidence: 0.35 };
}

export function titleFromBody(body: string) {
  const firstLine = body.trim().split(/\r?\n/)[0] || "Untitled capture";
  return firstLine.length > 82 ? `${firstLine.slice(0, 79)}...` : firstLine;
}

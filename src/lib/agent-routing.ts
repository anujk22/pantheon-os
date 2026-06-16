export type AgentId =
  | "athena"
  | "hermes"
  | "apollo"
  | "artemis"
  | "hephaestus"
  | "dionysus";

export type AgentRoutingDisplay = {
  id: AgentId;
  name: string;
  role: string;
  image: string;
};

export const agentRoutingDisplays: Record<AgentId, AgentRoutingDisplay> = {
  athena: {
    id: "athena",
    name: "Athena",
    role: "Mission architect",
    image: "/persona-athena-v2.png",
  },
  hermes: {
    id: "hermes",
    name: "Hermes",
    role: "Planning router",
    image: "/persona-hermes-v2.png",
  },
  apollo: {
    id: "apollo",
    name: "Apollo",
    role: "Insight analyst",
    image: "/persona-apollo-v2.png",
  },
  artemis: {
    id: "artemis",
    name: "Artemis",
    role: "Execution tracker",
    image: "/persona-artemis-v2.png",
  },
  hephaestus: {
    id: "hephaestus",
    name: "Hephaestus",
    role: "Systems engineer",
    image: "/persona-hephaestus-v2.png",
  },
  dionysus: {
    id: "dionysus",
    name: "Dionysus",
    role: "Creative catalyst",
    image: "/persona-dionysus-v2.png",
  },
};

export function routeAgentId(message: string): AgentId {
  const text = message.toLowerCase();

  if (/\b(code|bug|error|api|database|schema|integration|automation|script|build|deploy|repo|terminal|debug|implement|server)\b/.test(text)) {
    return "hephaestus";
  }

  if (/\b(task|deadline|due|execute|execution|next action|blocker|milestone|progress|todo|ship|finish)\b/.test(text)) {
    return "artemis";
  }

  if (/\b(research|summarize|summary|compare|pattern|analyze|analysis|insight|study|notes|extract|evidence)\b/.test(text)) {
    return "apollo";
  }

  if (/\b(plan|strategy|goal|roadmap|case|brief|prioritize|sequence|organize|project)\b/.test(text)) {
    return "hermes";
  }

  if (/\b(name|brand|design|creative|brainstorm|story|narrative|copy|aesthetic|visual|polish|rewrite)\b/.test(text)) {
    return "dionysus";
  }

  return "athena";
}

export function routeAgentDisplay(message: string): AgentRoutingDisplay {
  return agentRoutingDisplays[routeAgentId(message)];
}

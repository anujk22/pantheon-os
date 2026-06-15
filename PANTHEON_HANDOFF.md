# Pantheon OS (Agentic OS) - Handoff Document

Welcome, newly instantiated Agent. You have been summoned by the user to continue the development of **Pantheon OS** (formerly Agentic OS), an intelligent, highly-aesthetic desktop and web platform that unifies AI agent execution, memory, artifacts, and automations into one god-tier interface.

This document serves as your definitive guide to the current architecture, design philosophy, and technical state of the application.

---

## 1. Project Overview & Philosophy

**The Vision**: Pantheon OS is not a standard SaaS dashboard. It is a premium, mythological-themed local OS for managing autonomous agents. 
- **Aesthetic**: Think pristine white marble (Greek/Roman statues), glassmorphism, glowing emerald accents, and gold tracking lines. No "corny" or "gimmicky" terminology in the UI—keep it strictly professional but visually god-tier. 
- **Local First**: The system allows the user to bring their own LLM (via LM Studio, Ollama, or OpenAI) so they retain full privacy and local control. 
- **The Core AI**: "Athena" is the default Commander Agent, responsible for reasoning and generating artifacts.

---

## 2. Technical Stack

- **Framework**: Next.js 16.2.9 (App Router) with Turbopack.
- **Styling**: Tailwind CSS (v4) + Vanilla CSS (`globals.css`) for core variables.
- **Database**: SQLite database using `@libsql/client` and Prisma (`@prisma/client` & `@prisma/adapter-libsql`).
- **AI Integration**: Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`).
- **Desktop App**: An Electron wrapper (`electron:dev` script) encapsulates the Next.js server so it can boot as a native macOS application.

---

## 3. Architecture & Key Files

### Database (`prisma/schema.prisma`)
The schema contains definitions for `User`, `Case`, `Task`, `Event`, `ChatSession`, `ChatMessage`, `Artifact`, and `MorningBriefing`.
**CRITICAL NOTE**: In Prisma 7.8.0, the `url` parameter in `schema.prisma` is deprecated. We use `libsql` adapter to instantiate Prisma.
- **Initialization Location**: `src/lib/prisma.ts`. This file MUST be imported for all database queries.

### Core Layout (`src/app/layout.tsx` & `src/components/layout/*`)
The UI is built on a 5-Column layout:
1. **LeftSidebar**: The ionic column graphic + navigation menu.
2. **AgentStatus**: The glowing green 3D vector-space orb (using `react-force-graph-3d`) and token tracking.
3. **Main Content (page.tsx)**: The primary Mission Control area.
4. **RightSidebar**: Daily context, calendar, and active case boards.
5. **TopBar & BottomBar**: The branding header and the system nominal footer.

*Note: The `ClientShellWrapper.tsx` ensures that the `Shell` layout is hidden on the `/onboarding` route.*

### AI & API Integration
- **`src/app/api/chat/route.ts`**: The streaming AI endpoint. It queries the `User` config from SQLite (provider, base URL, API key), constructs a dynamic OpenAI client (`createOpenAI`), and streams the text back to the frontend.
- **`src/app/page.tsx`**: Uses `useChat` to render live streaming messages between the User (Zeus) and the Assistant (Athena).

### Onboarding & Settings
- **`src/app/onboarding/page.tsx`**: Forces the user to configure their LLM before accessing the system.
- **`src/app/settings/page.tsx` & `actions.ts`**: Contains a "Reset Onboarding" button that clears the `pantheon_onboarded` cookie.

---

## 4. Current State & Known Behaviors

### What works perfectly:
1. **The 5-Column Dashboard UI**: Fully built, styled, and responsive.
2. **Onboarding Flow**: Successfully captures data and upserts to `local-admin@pantheon.local`.
3. **LLM Connection**: The `/api/chat` endpoint correctly talks to the local LLM and streams data to the `page.tsx` UI without crashing.
4. **No Fake Data**: All mock data in the Right Sidebar has been stripped out. The placeholders are functionally empty.

### What needs to be built next (Your tasks):
1. **Placeholder Routes**: We created blank "Under Construction" pages for `/chat`, `/artifacts`, `/vault`, `/agents`, `/integrations`, `/automations`, and `/analytics`. You will need to build these out.
2. **Chat Session Persistence**: Currently, the AI streams to the UI, but it does NOT save the `ChatMessage` back into SQLite via Prisma. You need to implement the `onFinish` block in `/api/chat/route.ts` to log history.
3. **Artifact Generation Logic**: Teach Athena how to output `<Artifact>` JSON blocks, parse them on the frontend, and render the beautiful code blocks that we had previously mocked out.
4. **Integrations**: Build out the Google Calendar API sync to populate the Right Sidebar.

---

## 5. Agent Instructions (Rules of Engagement)

- **Do NOT use fake mock data**: If an integration is missing, display a clean empty state (e.g., "0 Tasks", "No Calendar Linked"). Never hardcode fake strings.
- **Respect the Aesthetic**: Always use `--color-pantheon-emerald-main`, `#1B3B2B`, `#D4AF37` (gold), `#F4F4F0` (marble). Do not throw random hex codes into the mix without verifying against the existing palette.
- **Next.js 16 Warnings**: `cookies()` is asynchronous. Prisma requires the `adapter` instantiation. Pay close attention to these modern React patterns.

Good luck. Direct your agents. Manifest results.

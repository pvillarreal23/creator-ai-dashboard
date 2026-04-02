# Creator AI Dashboard — 32-Agent YouTube Empire Operating System

A production-grade operations dashboard and agency operating system for a multi-channel YouTube empire powered by 32 specialized AI agents. Built post-consolidation as a unified, hierarchical organization with autonomous agent delegation, real-time communication, and continuous optimization.

**Live demo:** https://creator-ai-dashboard.vercel.app

## Overview

This is the consolidated, single-source-of-truth repository for the Creator AI agency. All 32 agents run in a 9-tier hierarchy, communicating via an async message bus (email-like interface). The dashboard provides real-time visibility into agent tasks, workflows, dependencies, and output quality.

**What's different after consolidation:**
- Single unified repo instead of fragmented microservices
- Consistent agent definition format (markdown + YAML front matter)
- Centralized config and constants for persona mapping, org structure, and styles
- Backend API for thread-based agent communication and delegation routing
- Vercel-deployed frontend with Next.js 14, React 18, TypeScript, Tailwind

## Architecture

### 9-Tier Organization (32 Agents)

```
TIER 1: Executive Leadership (1)
  ├─ ceo-agent — Marcus Chen

TIER 2: Vice Presidents (4)
  ├─ analytics-vp — Priya Sharma
  ├─ content-vp — Sofia Rivera
  ├─ monetization-vp — Daniel Kim
  └─ operations-vp — James Okafor

TIER 3: Department Managers (3)
  ├─ ai-tech-channel-manager — Aisha Patel
  ├─ finance-channel-manager — Ryan Mitchell
  └─ psychology-channel-manager — Elena Vasquez

TIER 4: Specialists — Content & Production (8)
  ├─ hook-specialist — Mia Jackson
  ├─ scriptwriter — Noah Thompson
  ├─ seo-specialist — Ethan Park
  ├─ shorts-clips-agent — Zara Ahmed
  ├─ storyteller — Liam O'Connor
  ├─ thumbnail-designer — Kai Nakamura
  ├─ video-editor — Isabella Torres
  └─ voice-director — Carmen Reyes

TIER 5: Operations & Infrastructure (5)
  ├─ automation-engineer — Alex Petrov
  ├─ project-manager — Olivia Bennett
  ├─ quality-assurance-lead — Hannah Lee
  ├─ reflection-council — Victor Andrei
  └─ workflow-orchestrator — Amir Hassan

TIER 6: Research & Analysis (3)
  ├─ data-analyst — Chloe Williams
  ├─ senior-researcher — Grace Nguyen
  └─ trend-researcher — Leo Martinez

TIER 7: Business Development (4)
  ├─ affiliate-coordinator — Natalie Brooks
  ├─ digital-product-manager — Raj Kapoor
  ├─ newsletter-strategist — Sarah Lindgren
  └─ partnership-manager — Omar Farouk

TIER 8: Community & Communications (3)
  ├─ community-manager — Tyler Robinson
  ├─ secretary-agent — Emma Fischer
  └─ social-media-manager — Jade Moreau

TIER 9: Governance & Compliance (1)
  └─ compliance-officer — David Reeves
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Anthropic API key (`sk-ant-*`)

### Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local and set:
#   NEXT_PUBLIC_API_URL=http://localhost:8000 (for local dev)
#   NEXT_PUBLIC_API_URL=https://your-backend-url (for production)

# Start dev server
npm run dev
# Open http://localhost:3000
```

**Build for production:**
```bash
npm run build
npm run start
```

### Backend Setup (Agent Communication API)

```bash
cd backend

# Create Python environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install fastapi "uvicorn[standard]" anthropic sqlalchemy aiosqlite python-frontmatter python-dotenv pydantic greenlet

# Create .env in project root
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > ../.env

# Start server
PYTHONPATH=$PWD uvicorn app.main:app --reload --port 8000
```

The backend exposes:
- `GET /api/agents` — List all 32 agents with summaries
- `GET /api/agents/{id}` — Get full agent detail with system prompt
- `GET /api/agents/org/tree` — Org chart nodes and edges for visualization
- `POST /api/threads` — Create communication thread
- `POST /api/threads/{id}/messages` — Send message (triggers delegation)
- `GET /api/threads` — List all threads
- `GET /api/threads/{id}` — Get thread with full message history

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide icons, Recharts |
| **Backend** | Python FastAPI, SQLAlchemy ORM, SQLite, Anthropic Claude SDK |
| **AI Models** | Claude Sonnet 4.6 (agent responses), Claude Haiku 4.5 (routing analysis) |
| **Agents** | Markdown with YAML frontmatter; system prompts embedded; org structure in constants |
| **Deployment** | Vercel (frontend), any Python host (backend) |
| **Build Tools** | Tailwind CSS, TypeScript, ESLint, PostCSS |

## Core Concepts

### Agent Personas (constants.ts)

Each agent is mapped to a real persona with a human name and gender. The system uses this for:
- Avatar references (`/avatars/{agentId}.jpg`)
- Human-readable delegation ("Sofia Rivera, content-vp approved this")
- Tone and voice consistency in agent responses

### System Prompt (operating-system.md)

All agents follow the **The AI Edge Agency Operating System v1.0**, which defines:
- Reasoning protocol: INTERPRET → CONSTRAIN → MAP → EXECUTE → REFLECT
- Quality gates: ACCURACY, RELEVANCE, VOICE
- Human voice mandate: zero AI filler, conversational tone, specific opinions
- Escalation rules: bubble to CEO-agent when conflicts arise
- Scope discipline: state clearly when a task is out of scope

### Message Routing & Delegation

1. User sends a task to CEO-agent via Command Center
2. FastAPI thread endpoint triggers CEO response (Claude Sonnet)
3. CEO response is analyzed for delegation hints (mentions of other agent names)
4. Routing engine cascades message to up to 5 agents in parallel
5. Responses are threaded and surfaced in UI in real time

### Agent Definition Format

Agents are stored as markdown files in `agents/tier-{1-9}/`:

```markdown
---
name: "scriptwriter"
humanName: "Noah Thompson"
tier: 4
department: "content"
reports_to: "content-vp"
collaborates_with:
  - "hook-specialist"
  - "storyteller"
  - "voice-director"
---

[Your system prompt here]
```

The YAML front matter is parsed by Python's `python-frontmatter`, allowing agents to be both human-readable and machine-indexable.

## Project Structure

```
creator-ai-dashboard/
├── agents/
│   ├── tier-1/ (1 agent)
│   ├── tier-2/ (4 agents)
│   ├── tier-3/ (3 agents)
│   ├── tier-4/ (8 agents)
│   ├── tier-5/ (5 agents)
│   ├── tier-6/ (3 agents)
│   ├── tier-7/ (4 agents)
│   ├── tier-8/ (3 agents)
│   └── tier-9/ (1 agent)
├── backend/
│   ├── app/
│   │   ├── main.py — FastAPI routes
│   │   ├── models.py — SQLAlchemy models
│   │   └── routers/ — Agent and thread endpoints
│   └── .env — Anthropic API key
├── src/
│   ├── components/ — React components
│   ├── app/ — Next.js pages and layouts
│   ├── lib/
│   │   ├── api.ts — Frontend API client
│   │   ├── constants.ts — Agent personas, tier styles, dept colors
│   │   └── utils.ts — Helpers
│   └── styles/
├── core/
│   └── operating-system.md — Shared agent system prompt
├── public/
│   └── avatars/ — Agent profile images
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── vercel.json — Vercel rewrite rules
└── README.md
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Dashboard Tabs

- **Overview** — Real-time KPIs, agent activity feed, recent threads
- **Agents** — Browse all 32 agents; filter by tier, department, or search
- **Org Chart** — Bracket visualization of reporting structure
- **Threads** — Async communication history; search and filter
- **Automation** — Make.com integration; workflow execution logs (if available)
- **Skills** — Agent capabilities matrix; who can do what
- **Analytics** — Trends, performance metrics, quality scores

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Vercel auto-deploys on push to `main`
3. Preview deployments on PRs
4. Set `NEXT_PUBLIC_API_URL` env var in Vercel dashboard

### Backend (Any Python Host)
1. Push code to repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set `ANTHROPIC_API_KEY` env var
4. Start with: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

## Development Notes

### Adding a New Agent

1. Create a markdown file in `agents/tier-{N}/agent-name.md`
2. Add YAML front matter with metadata
3. Write the system prompt below the `---` divider
4. Update `src/lib/constants.ts` with persona mapping if needed
5. Commit and push

### Modifying Agent Personas

Edit `src/lib/constants.ts`:
```typescript
const _PERSONAS: Record<string, { humanName: string; gender: "male" | "female" }> = {
  "agent-id": { humanName: "Full Name", gender: "male" | "female" },
  // ...
};
```

### Testing Agent Responses

Use the Threads tab to send test messages. Responses from Claude are cached locally in SQLite (`threads.db`).

## Quality Standards

All agents must meet the The AI Edge Quality Gate before delivery:
- **ACCURACY** — Factually correct and current
- **RELEVANCE** — Serves the AI/automation niche
- **VOICE** — Sharp, intelligent, energetic, zero fluff

Every output is logged with a confidence score (1–10). Scores below 7 are revised before delivery.

## License

Proprietary — The AI Edge YouTube Empire

## Support & Feedback

For questions, bugs, or feature requests, open an issue or contact the team via the Command Center (CEO-agent).

# Creator AI — YouTube Empire Dashboard

A real-time operations dashboard for a multi-channel YouTube empire. 32 AI agents run in a hierarchical org structure — from CEO to specialists — communicating through a business email-style command center.

**Live demo:** https://creator-ai-dashboard.vercel.app

## Features

- **7-tab Dashboard**: Overview, Pipeline, Channels, Skills, Automation, Analytics, Agents
- **32 AI Agents**: Full org hierarchy with CEO, VPs, Managers, and Specialists
- **Command Center**: Single-prompt interface — send a task to the CEO, agents auto-delegate
- **Agent Directory**: Browse agents by tier (C-Suite/VP/Manager/Specialist) or department
- **Org Chart**: Bracket-style visualization of reporting structure
- **Newsletter Hub**: Quick-action tools for email marketing strategy
- **AI Research Tools**: One-click prompts for trend scanning, competitor analysis, title generation
- **Recommended Prompts**: Pre-built prompts across Content, Growth, Revenue, Operations, Newsletter, Web & Design

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Anthropic API key

### Frontend
```bash
npm install
cp .env.local.example .env.local  # or create with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                        # http://localhost:3000
```

### Backend (Agent Communication API)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" anthropic sqlalchemy aiosqlite python-frontmatter python-dotenv pydantic greenlet
```

Create `.env` in the project root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the server:
```bash
PYTHONPATH=$PWD uvicorn app.main:app --reload --port 8000
```

## Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend:** Python FastAPI + Anthropic SDK + SQLite
- **AI Models:** Claude Sonnet (agent responses), Claude Haiku (routing analysis)
- **Agents:** 32 markdown-defined agents with system prompts, org hierarchy, and collaboration rules
- **Automation:** Make.com integration for video production pipeline

## Agent Org Structure

```
CEO (Marcus Chen)
├── Content VP (Sofia Rivera)
│   ├── AI & Tech Channel Manager
│   ├── Finance Channel Manager
│   ├── Psychology Channel Manager
│   ├── Scriptwriter, Hook Specialist, Storyteller
│   ├── Shorts & Clips Agent
│   └── Social Media Manager
├── Operations VP (James Okafor)
│   ├── Project Manager, Workflow Orchestrator, QA Lead
│   ├── Video Editor, Thumbnail Designer
│   └── Web Designer, Web Developer
├── Analytics VP (Priya Sharma)
│   ├── Data Analyst, Trend Researcher
│   ├── SEO Specialist, Senior Researcher
├── Monetization VP (Daniel Kim)
│   ├── Partnership Manager, Affiliate Coordinator
│   ├── Digital Product Manager, Newsletter Strategist
│   └── Community Manager
├── Secretary (Emma Fischer)
├── Compliance Officer (David Reeves)
└── Reflection Council (Victor Andrei)
```

## How Agent Communication Works

1. You type a task in the Command Center
2. It's sent to the CEO agent (powered by Claude)
3. CEO responds and the routing engine analyzes who to delegate to
4. Delegated agents respond with full thread context
5. Routing cascades up to 5 hops deep through the org hierarchy

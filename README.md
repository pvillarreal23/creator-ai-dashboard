# Creator AI — Faceless Channel Dashboard

A real-time operations dashboard for an autonomous YouTube faceless channel. Five AI agents run in parallel — from script generation to social posting — and stream live status into a single control panel.

**Live demo:** https://creator-ai-dashboard.vercel.app

## Architecture

```
Dashboard (Vercel) ──► Make.com Webhook
                              │
                                            ┌───────────────┼───────────────┐
                                                          ▼               ▼               ▼
                                                                 ScriptGen-Agent  Voice-ElevenLabs  Vision-Midjourney
                                                                        (Claude Sonnet)  (Claude Haiku)    (Gemini Pro)
                                                                                      │               │               │
                                                                                                    ▼               ▼               ▼
                                                                                                           Google Sheets    ElevenLabs TTS   Midjourney API
                                                                                                                         │
                                                                                                                            ┌──────────┴──────────┐
                                                                                                                               ▼                     ▼
                                                                                                                               Editor-AutoCut      Social-Poster
                                                                                                                               (Gemini Pro)        (Gemini Pro)
                                                                                                                               ```
                                                                                                                               
                                                                                                                               ## Agent Pipeline
                                                                                                                               
                                                                                                                               | Agent | Model | Role | Output |
                                                                                                                               |---|---|---|---|
                                                                                                                               | ScriptGen-Agent | Claude Sonnet 4.6 | Writes video scripts | Google Sheets |
                                                                                                                               | Voice-ElevenLabs | Claude Haiku 4.5 | Voiceover synthesis | ElevenLabs TTS |
                                                                                                                               | Vision-Midjourney | Gemini 3.1 Pro | Thumbnail generation | Midjourney API |
                                                                                                                               | Editor-AutoCut | Gemini 3.1 Pro | Video editing | AutoCut |
                                                                                                                               | Social-Poster | Gemini 3.1 Pro | Cross-platform upload | YouTube / TikTok |
                                                                                                                               
                                                                                                                               ## Make.com Scenario
                                                                                                                               
                                                                                                                               **Scenario:** YouTube Agency — Video Production Pipeline (ID 4571122)
                                                                                                                               
                                                                                                                               The pipeline is triggered by a custom webhook. Pressing **New Task** in the dashboard fires a `POST` to the Make.com webhook, which runs:
                                                                                                                               
                                                                                                                               1. **Webhooks (1)** — receives the trigger payload
                                                                                                                               2. **Anthropic Claude (3)** — generates the video script
                                                                                                                               3. **Google Sheets (6)** — stores the script output
                                                                                                                               4. **ElevenLabs (8)** — synthesizes the voiceover *(API key required)*
                                                                                                                               5. **Webhooks (7)** — returns `200 OK` with the result
                                                                                                                               
                                                                                                                               If Claude fails, an **error handler branch (9)** immediately returns `HTTP 500` with a JSON error body instead of silently failing.
                                                                                                                               
                                                                                                                               ## Stack
                                                                                                                               
                                                                                                                               - **Frontend:** Vanilla JS + CSS (no framework) — `index.html`, `app.js`, `styles.css`
                                                                                                                               - **Hosting:** Vercel (auto-deploy on push to `main`)
                                                                                                                               - **Automation:** Make.com (scenario 4571122)
                                                                                                                               - **AI:** Anthropic Claude (script gen), ElevenLabs (voice), Gemini (vision/edit/post)
                                                                                                                               - **Storage:** Google Sheets (script archive)
                                                                                                                               
                                                                                                                               ## Pending / Roadmap
                                                                                                                               
                                                                                                                               - [ ] Connect ElevenLabs API key to Make.com module 8
                                                                                                                               - [ ] Vision-Midjourney thumbnail generation pipeline
                                                                                                                               - [ ] Editor-AutoCut video editing pipeline
                                                                                                                               - [ ] Social-Poster cross-platform upload pipeline
                                                                                                                               - [ ] Real webhook-to-dashboard feedback loop (live run status)

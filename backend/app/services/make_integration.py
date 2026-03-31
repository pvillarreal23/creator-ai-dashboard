"""
Make.com Integration Service

Agents trigger Make.com scenarios to execute real work:
- Script generation → Google Sheets
- Voiceover synthesis → ElevenLabs
- Thumbnail creation → Midjourney/Canva
- Video assembly → InVideo
- SEO optimization → YouTube metadata
- Upload scheduling → YouTube API
- Social posting → Multi-platform distribution

All outputs flow through the approval pipeline before going live.
"""
from __future__ import annotations

import os
import uuid
import json
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from app.database import async_session
from app.models.scheduler import Escalation
from app.models.thread import Thread, Message
from app.models.agent import Agent

# Make.com webhook URLs — agents trigger these to execute real work
MAKE_WEBHOOKS = {
    # Production pipeline scenarios
    "research": os.getenv("MAKE_WEBHOOK_RESEARCH", ""),
    "script_generation": os.getenv("MAKE_WEBHOOK_SCRIPT", ""),
    "voiceover": os.getenv("MAKE_WEBHOOK_VOICEOVER", ""),
    "thumbnail": os.getenv("MAKE_WEBHOOK_THUMBNAIL", ""),
    "video_assembly": os.getenv("MAKE_WEBHOOK_VIDEO", ""),
    "seo_optimization": os.getenv("MAKE_WEBHOOK_SEO", ""),
    "upload_schedule": os.getenv("MAKE_WEBHOOK_UPLOAD", ""),
    "social_post": os.getenv("MAKE_WEBHOOK_SOCIAL", ""),

    # Business operations scenarios
    "newsletter_send": os.getenv("MAKE_WEBHOOK_NEWSLETTER", ""),
    "analytics_pull": os.getenv("MAKE_WEBHOOK_ANALYTICS", ""),
    "sheets_update": os.getenv("MAKE_WEBHOOK_SHEETS", ""),
    "notify_pedro": os.getenv("MAKE_WEBHOOK_NOTIFY", ""),

    # General purpose
    "custom": os.getenv("MAKE_WEBHOOK_CUSTOM", ""),
}

# Which agents can trigger which scenarios
AGENT_PERMISSIONS = {
    "scriptwriter-agent": ["script_generation", "sheets_update"],
    "hook-specialist-agent": ["script_generation"],
    "storyteller-agent": ["script_generation"],
    "video-editor-agent": ["video_assembly", "voiceover"],
    "thumbnail-designer-agent": ["thumbnail"],
    "seo-specialist-agent": ["seo_optimization", "sheets_update"],
    "social-media-manager-agent": ["social_post"],
    "shorts-and-clips-agent": ["video_assembly", "social_post"],
    "newsletter-strategist-agent": ["newsletter_send", "sheets_update"],
    "data-analyst-agent": ["analytics_pull", "sheets_update"],
    "trend-researcher-agent": ["research", "sheets_update"],
    "senior-researcher-agent": ["research", "sheets_update"],
    "project-manager-agent": ["sheets_update", "notify_pedro"],
    "secretary-agent": ["sheets_update", "notify_pedro"],
    "web-designer-agent": ["custom"],
    "web-developer-agent": ["custom"],
    "community-manager-agent": ["social_post"],

    # VPs can trigger anything in their domain
    "content-vp-agent": ["script_generation", "research", "sheets_update", "notify_pedro"],
    "operations-vp-agent": ["video_assembly", "voiceover", "thumbnail", "sheets_update", "notify_pedro"],
    "analytics-vp-agent": ["analytics_pull", "seo_optimization", "research", "sheets_update", "notify_pedro"],
    "monetization-vp-agent": ["newsletter_send", "social_post", "sheets_update", "notify_pedro"],

    # CEO can trigger everything
    "ceo-agent": list(MAKE_WEBHOOKS.keys()),
}

# Actions that require Pedro's approval before executing
REQUIRES_APPROVAL = {
    "upload_schedule",   # Publishing to YouTube
    "social_post",       # Posting publicly
    "newsletter_send",   # Sending to email list
    "notify_pedro",      # Notifying Pedro directly
}

# Actions that can run autonomously (internal work only)
AUTO_APPROVE = {
    "research",          # Research is always safe
    "script_generation", # Drafting scripts (not publishing)
    "voiceover",         # Generating voiceover files
    "thumbnail",         # Creating thumbnail options
    "video_assembly",    # Assembling video (not uploading)
    "seo_optimization",  # Preparing SEO metadata
    "analytics_pull",    # Pulling analytics data
    "sheets_update",     # Updating internal spreadsheets
    "custom",            # Custom webhooks (internal)
}


async def trigger_make_scenario(
    agent_id: str,
    scenario: str,
    payload: dict,
    thread_id: Optional[str] = None,
) -> dict:
    """
    Trigger a Make.com scenario from an agent.

    Returns: {"status": "triggered"|"queued_for_approval"|"denied", ...}
    """
    import httpx

    # Check permissions
    allowed = AGENT_PERMISSIONS.get(agent_id, [])
    if scenario not in allowed:
        return {
            "status": "denied",
            "reason": f"Agent {agent_id} does not have permission for '{scenario}'",
        }

    # Check if webhook URL is configured
    webhook_url = MAKE_WEBHOOKS.get(scenario, "")
    if not webhook_url:
        return {
            "status": "not_configured",
            "reason": f"Make.com webhook for '{scenario}' is not configured. Add MAKE_WEBHOOK_{scenario.upper()} to .env",
        }

    # Check if approval is needed
    if scenario in REQUIRES_APPROVAL:
        # Create an escalation for Pedro to approve
        async with async_session() as db:
            escalation = Escalation(
                id=str(uuid.uuid4()),
                thread_id=thread_id or "",
                agent_id=agent_id,
                reason=f"Requesting approval to execute: {scenario}\nPayload: {json.dumps(payload, indent=2)[:500]}",
                severity="high",
            )
            db.add(escalation)
            await db.commit()

        return {
            "status": "queued_for_approval",
            "reason": f"'{scenario}' requires Pedro's approval. Escalation created.",
            "escalation_id": escalation.id,
        }

    # Auto-approved — execute immediately
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                webhook_url,
                json={
                    "agent_id": agent_id,
                    "scenario": scenario,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "thread_id": thread_id,
                    **payload,
                },
            )
            return {
                "status": "triggered",
                "http_status": response.status_code,
                "response": response.text[:500],
            }
    except Exception as e:
        return {
            "status": "error",
            "reason": str(e)[:300],
        }


async def get_agent_capabilities(agent_id: str) -> dict:
    """Return what Make.com scenarios an agent can trigger."""
    allowed = AGENT_PERMISSIONS.get(agent_id, [])
    capabilities = {}
    for scenario in allowed:
        webhook = MAKE_WEBHOOKS.get(scenario, "")
        capabilities[scenario] = {
            "configured": bool(webhook),
            "requires_approval": scenario in REQUIRES_APPROVAL,
            "auto_approve": scenario in AUTO_APPROVE,
        }
    return capabilities

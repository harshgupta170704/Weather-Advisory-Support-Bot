"""FastAPI entry point.

Nothing fancy here — just the REST endpoints, CORS setup, and session
management. The heavy lifting happens in the LangGraph pipeline.
"""

from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.config import settings
from backend.app.graph.builder import advisor_graph
from backend.app.graph.nodes import get_sops
from backend.app.models import (
    ChatRequest,
    ChatResponse,
    LocationData,
    SessionResponse,
    TraceStep,
    WeatherData,
)

# Load environment variables
load_dotenv()

# Logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(name)-25s | %(levelname)-7s | %(message)s",
)
logger = logging.getLogger("climaguard.api")

# ── App ─────────────────────────────────────────────────────

app = FastAPI(
    title="ClimaGuard",
    description="Policy-grounded weather advisory for outdoor activities",
    version="1.0.0",
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Quick and dirty session store. A dict is fine for a demo — in prod
# you'd want Redis or something. Sessions die on server restart.
_sessions: dict[str, dict[str, Any]] = {}


def _get_session_context(session_id: str) -> dict[str, str] | None:
    """Retrieve previous context for session continuity."""
    return _sessions.get(session_id)


def _update_session(session_id: str, state: dict[str, Any]) -> None:
    """Store relevant context for follow-up questions."""
    _sessions[session_id] = {
        "activity": state.get("activity", ""),
        "activity_category": state.get("activity_category", ""),
        "audience": state.get("audience", "general"),
        "location": state.get("location_name", "") or state.get("resolved_city", ""),
    }


# ── Health ──────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ClimaGuard",
        "sops_loaded": len(get_sops()),
        "llm_provider": settings.llm_provider,
    }


# ── Session ─────────────────────────────────────────────────

@app.post("/api/session/new", response_model=SessionResponse)
async def new_session():
    """Create a new chat session."""
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {}
    logger.info("New session created: %s", session_id)
    return SessionResponse(session_id=session_id)


# ── Chat ────────────────────────────────────────────────────

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message through the LangGraph advisory pipeline."""
    logger.info(
        "Chat request | session=%s | message=%s",
        request.session_id,
        request.message[:80],
    )

    # Build initial state
    previous_context = _get_session_context(request.session_id)

    initial_state = {
        "session_id": request.session_id,
        "user_query": request.message,
        "messages": [],
        "activity": "",
        "activity_category": "",
        "audience": "general",
        "location_name": "",
        "time_window": "current",
        "latitude": None,
        "longitude": None,
        "resolved_city": "",
        "resolved_country": "",
        "weather": None,
        "weather_source": "",
        "matching_sops": [],
        "selected_sop": None,
        "selection_reason": "",
        "final_answer": "",
        "error_type": "",
        "error_message": "",
        "status": "",
        "trace": [],
        "previous_context": previous_context,
    }

    try:
        # Run the LangGraph pipeline
        result = await advisor_graph.ainvoke(initial_state)

        # Update session memory
        _update_session(request.session_id, result)

        # Build location data
        location = None
        if result.get("resolved_city"):
            location = LocationData(
                city=result["resolved_city"],
                country=result.get("resolved_country", ""),
                latitude=result.get("latitude", 0),
                longitude=result.get("longitude", 0),
            )

        # Build weather data
        weather = None
        if result.get("weather"):
            weather = WeatherData(**result["weather"])

        # Build SOP info for response
        selected_sop_info = None
        if result.get("selected_sop"):
            sop = result["selected_sop"]["sop"]
            selected_sop_info = {
                "id": sop["id"],
                "title": sop["title"],
                "severity": sop["severity"],
                "category": sop["category"],
                "reason": sop["reason"],
                "matched_conditions": result["selected_sop"].get("matched_conditions", {}),
                "selection_reason": result.get("selection_reason", ""),
            }

        matching_sops_info = []
        for m in result.get("matching_sops", []):
            matching_sops_info.append({
                "id": m["sop"]["id"],
                "title": m["sop"]["title"],
                "severity": m["sop"]["severity"],
            })

        # Build trace
        trace = [TraceStep(**t) for t in result.get("trace", [])]

        return ChatResponse(
            answer=result.get("final_answer", "Sorry, something went wrong."),
            session_id=request.session_id,
            status=result.get("status", "error"),
            location=location,
            weather=weather,
            selected_sop=selected_sop_info,
            matching_sops=matching_sops_info,
            trace=trace,
        )

    except Exception as exc:
        logger.exception("Unhandled error in chat pipeline")
        return ChatResponse(
            answer="An unexpected error occurred. Please try again.",
            session_id=request.session_id,
            status="error",
            trace=[TraceStep(step="System", detail=str(exc), status="error")],
        )


# ── SOPs ────────────────────────────────────────────────────

@app.get("/api/sops")
async def list_sops():
    """List all loaded SOPs (for debugging and transparency)."""
    sops = get_sops()
    return {
        "count": len(sops),
        "sops": [
            {
                "id": s.id,
                "title": s.title,
                "category": s.category,
                "severity": s.severity,
                "priority": s.priority,
                "activities": s.activities,
                "conditions": {
                    k: v.model_dump() for k, v in s.conditions.items()
                },
            }
            for s in sops
        ],
    }


# ── Static files (production frontend build) ───────────────

FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve the React SPA for any non-API route."""
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIST / "index.html"))

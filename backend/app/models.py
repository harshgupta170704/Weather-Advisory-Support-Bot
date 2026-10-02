"""Pydantic models shared across the app."""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field


# ── Weather ─────────────────────────────────────────────────

class LocationData(BaseModel):
    """Resolved geographic location."""
    city: str
    country: str
    latitude: float
    longitude: float


class WeatherData(BaseModel):
    """Normalized weather snapshot from Open-Meteo."""
    temperature_c: float
    precipitation_mm: float
    precipitation_probability: float
    wind_speed_kmh: float
    wind_gusts_kmh: float
    uv_index: float
    observed_at: str  # ISO-8601
    requested_window: str = "current"  # "current", "morning", "afternoon", "evening"
    source: str = "Open-Meteo"


# ── SOP / Policy ────────────────────────────────────────────

class SOPCondition(BaseModel):
    """A single numeric threshold condition."""
    gte: Optional[float] = None
    lte: Optional[float] = None


class SOPDefinition(BaseModel):
    """One Standard Operating Procedure loaded from YAML."""
    id: str
    title: str
    category: str
    severity: str  # LOW | MODERATE | HIGH | CRITICAL
    priority: int
    description: str
    activities: list[str]
    intent_hints: list[str]
    conditions: dict[str, SOPCondition]  # field_name -> threshold
    advice: str
    fallback_message: str
    reason: str


class SOPMatch(BaseModel):
    """A matched SOP with the reason it matched."""
    sop: SOPDefinition
    matched_conditions: dict[str, str]  # field -> "42 >= 40"


class PolicyDecision(BaseModel):
    """Result of the deterministic policy engine."""
    matching_sops: list[SOPMatch]
    selected_sop: Optional[SOPMatch] = None
    selection_reason: str = ""


# ── Parsed Intent ───────────────────────────────────────────

class ParsedIntent(BaseModel):
    """Structured output from the LLM intent parser."""
    is_chit_chat: bool = False
    activity: str = ""
    activity_category: str = ""
    audience: str = "general"  # general | children | elderly | pets
    location: str = ""
    time_window: str = "current"  # current | morning | afternoon | evening | tomorrow_morning | ...
    original_query: str = ""


# ── API Request / Response ──────────────────────────────────

class ChatRequest(BaseModel):
    """Incoming chat message from the frontend."""
    session_id: str
    message: str


class TraceStep(BaseModel):
    """One step in the decision trace shown in the UI."""
    step: str
    detail: str
    status: str = "ok"  # ok | error | skipped


class ChatResponse(BaseModel):
    """Structured response to the frontend."""
    answer: str
    session_id: str
    status: str  # success | no_policy | location_error | weather_error | validation_error | error
    location: Optional[LocationData] = None
    weather: Optional[WeatherData] = None
    selected_sop: Optional[dict[str, Any]] = None
    matching_sops: list[dict[str, Any]] = Field(default_factory=list)
    trace: list[TraceStep] = Field(default_factory=list)


class SessionResponse(BaseModel):
    """Response when creating a new session."""
    session_id: str

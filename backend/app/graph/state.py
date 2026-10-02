"""ClimaGuard — LangGraph state definition.

Strongly typed state object that flows through every graph node.
"""

from __future__ import annotations

from typing import Any, Optional
from typing_extensions import TypedDict


class WeatherAdvisorState(TypedDict, total=False):
    """State that flows through the LangGraph weather advisory pipeline.

    Every node reads from and writes to this state. The state is
    inspectable at every step for debugging and traceability.
    """

    # ── Session ─────────────────────────────────────────
    session_id: str
    user_query: str
    messages: list[dict[str, str]]

    # ── Parsed intent (from LLM) ────────────────────────
    activity: str
    activity_category: str
    audience: str
    location_name: str
    time_window: str

    # ── Location (from Open-Meteo geocoding) ────────────
    latitude: Optional[float]
    longitude: Optional[float]
    resolved_city: str
    resolved_country: str

    # ── Weather (from Open-Meteo forecast) ──────────────
    weather: Optional[dict[str, Any]]
    weather_source: str

    # ── Policy (from deterministic engine) ──────────────
    matching_sops: list[dict[str, Any]]
    selected_sop: Optional[dict[str, Any]]
    selection_reason: str

    # ── Answer ──────────────────────────────────────────
    final_answer: str

    # ── Error handling ──────────────────────────────────
    error_type: str
    error_message: str

    # ── Status tracking ─────────────────────────────────
    status: str  # success | no_policy | location_error | weather_error | validation_error | error

    # ── Trace ───────────────────────────────────────────
    trace: list[dict[str, str]]

    # ── Session context for memory ──────────────────────
    previous_context: Optional[dict[str, str]]

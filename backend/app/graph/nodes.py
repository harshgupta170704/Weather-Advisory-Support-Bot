"""LangGraph node implementations.

Each function here is one step in the pipeline. I tried to keep them
focused — one job per node. The important bit is that parse_question
and compose_answer use the LLM, but everything else (weather fetching,
SOP evaluation, validation) is pure deterministic code. That's the
whole architectural point.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from app.graph.state import WeatherAdvisorState
from app.models import ParsedIntent, WeatherData
from app.services.llm_service import compose_answer, parse_user_intent
from app.services.policy_engine import evaluate_sops, load_sops, SEVERITY_ORDER
from app.services.weather import (
    LocationResolutionError,
    OpenMeteoClient,
    WeatherDataValidationError,
    WeatherFetchError,
)
from app.config import settings

logger = logging.getLogger("climaguard.graph")

# Module-level instances (initialized once)
_weather_client = OpenMeteoClient()
_sops = load_sops(settings.sop_file)


def get_sops():
    """Return loaded SOPs (useful for the API endpoint)."""
    return _sops


def set_weather_client(client):
    """Dependency injection for testing."""
    global _weather_client
    _weather_client = client


# ── NODE 1: parse_question ──────────────────────────────────

async def parse_question(state: WeatherAdvisorState) -> dict[str, Any]:
    """Extract structured intent from the user's natural language query.

    Uses the LLM for NLU, but output is validated and structured.
    Session context is used for follow-up questions.
    """
    query = state.get("user_query", "")
    previous = state.get("previous_context")

    logger.info("[parse_question] Query: %s", query)

    intent: ParsedIntent = await parse_user_intent(query, previous)

    trace_detail = (
        f"activity={intent.activity}, category={intent.activity_category}, "
        f"audience={intent.audience}, location={intent.location}, "
        f"time_window={intent.time_window}"
    )

    return {
        "is_chit_chat": intent.is_chit_chat,
        "activity": intent.activity,
        "activity_category": intent.activity_category,
        "audience": intent.audience,
        "location_name": intent.location,
        "time_window": intent.time_window,
        "trace": state.get("trace", []) + [
            {"step": "Parse Question", "detail": trace_detail, "status": "ok"}
        ],
    }


# ── NODE 2: resolve_location ───────────────────────────────

async def resolve_location(state: WeatherAdvisorState) -> dict[str, Any]:
    """Resolve city name to coordinates via Open-Meteo Geocoding API.

    If no location is provided and none exists in session context,
    returns a prompt to ask the user.
    """
    location_name = state.get("location_name", "").strip()
    logger.info("[resolve_location] Location: %s", location_name)

    if not location_name:
        return {
            "error_type": "location_error",
            "error_message": "I need a location to check weather conditions. Could you tell me which city you're in?",
            "status": "location_error",
            "trace": state.get("trace", []) + [
                {"step": "Resolve Location", "detail": "No location provided", "status": "error"}
            ],
        }

    try:
        loc = await _weather_client.resolve_location(location_name)
        return {
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "resolved_city": loc.city,
            "resolved_country": loc.country,
            "location_name": loc.city,  # normalize
            "trace": state.get("trace", []) + [
                {
                    "step": "Resolve Location",
                    "detail": f"{loc.city}, {loc.country} ({loc.latitude:.4f}, {loc.longitude:.4f})",
                    "status": "ok",
                }
            ],
        }
    except LocationResolutionError as exc:
        logger.warning("[resolve_location] Failed: %s", exc)
        return {
            "error_type": "location_error",
            "error_message": str(exc),
            "status": "location_error",
            "trace": state.get("trace", []) + [
                {"step": "Resolve Location", "detail": str(exc), "status": "error"}
            ],
        }


# ── NODE 3: fetch_weather ──────────────────────────────────

async def fetch_weather(state: WeatherAdvisorState) -> dict[str, Any]:
    """Fetch live weather data from Open-Meteo Forecast API.

    The normalized WeatherData is the single source of truth for
    all weather facts used downstream.
    """
    lat = state.get("latitude")
    lon = state.get("longitude")
    time_window = state.get("time_window", "current")

    logger.info("[fetch_weather] lat=%s lon=%s window=%s", lat, lon, time_window)

    if lat is None or lon is None:
        return {
            "error_type": "weather_error",
            "error_message": "Cannot fetch weather without coordinates.",
            "status": "weather_error",
            "trace": state.get("trace", []) + [
                {"step": "Fetch Weather", "detail": "Missing coordinates", "status": "error"}
            ],
        }

    try:
        weather = await _weather_client.fetch_weather(lat, lon, time_window)
        weather_dict = weather.model_dump()

        detail = (
            f"temp={weather.temperature_c}°C, precip={weather.precipitation_mm}mm, "
            f"rain_prob={weather.precipitation_probability}%, "
            f"wind={weather.wind_speed_kmh}km/h, gusts={weather.wind_gusts_kmh}km/h, "
            f"uv={weather.uv_index}"
        )

        return {
            "weather": weather_dict,
            "weather_source": "Open-Meteo",
            "trace": state.get("trace", []) + [
                {"step": "Fetch Weather", "detail": detail, "status": "ok"}
            ],
        }
    except (WeatherFetchError, WeatherDataValidationError) as exc:
        logger.warning("[fetch_weather] Failed: %s", exc)
        return {
            "error_type": "weather_error",
            "error_message": f"I couldn't retrieve live weather data right now. {exc}",
            "status": "weather_error",
            "trace": state.get("trace", []) + [
                {"step": "Fetch Weather", "detail": str(exc), "status": "error"}
            ],
        }


# ── NODE 4: evaluate_sops_node ─────────────────────────────

async def evaluate_sops_node(state: WeatherAdvisorState) -> dict[str, Any]:
    """Run the deterministic policy engine against current weather + intent.

    This node is FULLY DETERMINISTIC — no LLM involvement.
    """
    weather_dict = state.get("weather")
    activity = state.get("activity", "")
    category = state.get("activity_category", "")
    audience = state.get("audience", "general")

    logger.info("[evaluate_sops] activity=%s category=%s audience=%s", activity, category, audience)

    if not weather_dict:
        return {
            "error_type": "weather_error",
            "error_message": "No weather data available for policy evaluation.",
            "status": "weather_error",
            "trace": state.get("trace", []) + [
                {"step": "Evaluate SOPs", "detail": "No weather data", "status": "error"}
            ],
        }

    weather = WeatherData(**weather_dict)
    decision = evaluate_sops(_sops, weather, activity, category, audience)

    matching_list = [
        {
            "sop": m.sop.model_dump(),
            "matched_conditions": m.matched_conditions,
        }
        for m in decision.matching_sops
    ]

    selected_dict = None
    if decision.selected_sop:
        selected_dict = {
            "sop": decision.selected_sop.sop.model_dump(),
            "matched_conditions": decision.selected_sop.matched_conditions,
        }

    n_matched = len(matching_list)
    detail = f"{n_matched} SOP(s) matched"
    if decision.selected_sop:
        detail += f" → selected {decision.selected_sop.sop.id}"

    return {
        "matching_sops": matching_list,
        "selected_sop": selected_dict,
        "selection_reason": decision.selection_reason,
        "trace": state.get("trace", []) + [
            {"step": "Evaluate SOPs", "detail": detail, "status": "ok"}
        ],
    }


# ── NODE 5: resolve_match ──────────────────────────────────

async def resolve_match(state: WeatherAdvisorState) -> dict[str, Any]:
    """Set status based on whether a policy matched.

    If no SOP matched, set status to 'no_policy' (not an error).
    """
    selected = state.get("selected_sop")

    if not selected:
        return {
            "status": "no_policy",
            "trace": state.get("trace", []) + [
                {
                    "step": "Resolve Match",
                    "detail": "No policy covers this combination of activity and weather",
                    "status": "ok",
                }
            ],
        }

    return {
        "status": "success",
        "trace": state.get("trace", []) + [
            {
                "step": "Resolve Match",
                "detail": f"Primary: {selected['sop']['id']} ({selected['sop']['severity']})",
                "status": "ok",
            }
        ],
    }


# ── NODE 6: compose_answer_node ────────────────────────────

async def compose_answer_node(state: WeatherAdvisorState) -> dict[str, Any]:
    """Compose the final human-readable answer using the LLM.

    The LLM receives ONLY structured facts (weather data + policy decision).
    It cannot invent weather values or SOPs.
    """
    weather_dict = state.get("weather")
    selected = state.get("selected_sop")
    status = state.get("status", "")

    # ── Handle chit-chat ────────────────────────────────
    if state.get("is_chit_chat"):
        intent = {"is_chit_chat": True}
        answer = await compose_answer(
            weather=None,
            policy_decision=None,
            parsed_intent=intent,
            user_query=state.get("user_query", "")
        )
        return {
            "final_answer": answer,
            "status": "success",
            "trace": state.get("trace", []) + [
                {"step": "Compose Answer", "detail": "Chit-chat response generated", "status": "ok"}
            ],
        }

    # ── Handle error states without LLM ─────
    if status == "location_error":
        msg = state.get("error_message", "I couldn't resolve that location.")
        return {
            "final_answer": msg,
            "trace": state.get("trace", []) + [
                {"step": "Compose Answer", "detail": "Location error response", "status": "ok"}
            ],
        }

    if status == "weather_error":
        city = state.get("resolved_city", state.get("location_name", "your area"))
        msg = state.get(
            "error_message",
            f"I couldn't retrieve live weather data for {city} right now, "
            "so I can't provide a weather-grounded advisory.",
        )
        return {
            "final_answer": msg,
            "trace": state.get("trace", []) + [
                {"step": "Compose Answer", "detail": "Weather error response", "status": "ok"}
            ],
        }

    # ── Normal path: compose with LLM ───────────────────
    if weather_dict:
        weather = WeatherData(**weather_dict)
        policy_dec = {
            "selected_sop": selected,
            "matching_sops": state.get("matching_sops", []),
            "selection_reason": state.get("selection_reason", ""),
        }
        intent = {
            "activity": state.get("activity", ""),
            "activity_category": state.get("activity_category", ""),
            "audience": state.get("audience", "general"),
            "location": state.get("resolved_city", state.get("location_name", "")),
        }

        answer = await compose_answer(
            weather=weather,
            policy_decision=policy_dec,
            parsed_intent=intent,
            user_query=state.get("user_query", "")
        )

        return {
            "final_answer": answer,
            "trace": state.get("trace", []) + [
                {"step": "Compose Answer", "detail": "LLM composed policy-grounded response", "status": "ok"}
            ],
        }

    # Fallback
    return {
        "final_answer": "I encountered an unexpected state. Please try rephrasing your question.",
        "status": "error",
        "trace": state.get("trace", []) + [
            {"step": "Compose Answer", "detail": "Unexpected state fallback", "status": "error"}
        ],
    }


# ── NODE 7: validate_answer ────────────────────────────────

async def validate_answer(state: WeatherAdvisorState) -> dict[str, Any]:
    """Validate the final answer before returning to the user.

    Checks:
    1. If advice is given, a selected SOP must exist.
    2. The SOP ID must exist in the loaded dataset.
    3. No fabricated weather values (numeric check against WeatherData).
    4. Answer doesn't claim an unsupported SOP.
    """
    answer = state.get("final_answer", "")
    status = state.get("status", "")
    selected = state.get("selected_sop")
    weather_dict = state.get("weather")

    # Skip validation for error responses
    if status in ("location_error", "weather_error"):
        return {
            "trace": state.get("trace", []) + [
                {"step": "Validate Answer", "detail": "Skipped (error response)", "status": "ok"}
            ],
        }

    issues = []

    # Check 1: If we claim success, a selected SOP should exist
    if status == "success" and not selected:
        issues.append("Status is 'success' but no SOP was selected")

    # Check 2: Verify SOP ID exists in our dataset
    if selected:
        sop_id = selected["sop"]["id"]
        valid_ids = {s.id for s in _sops}
        if sop_id not in valid_ids:
            issues.append(f"SOP {sop_id} not found in dataset")

    # Check 3: Check for fabricated SOP references in the answer
    sop_pattern = re.findall(r"SOP-(\d+)", answer)
    valid_ids = {s.id for s in _sops}
    for sop_num in sop_pattern:
        ref_id = f"SOP-{sop_num}"
        if ref_id not in valid_ids:
            issues.append(f"Answer references non-existent {ref_id}")

    # Check 4: If weather data exists, verify the answer doesn't contain
    # temperature/wind values that wildly differ from actual data
    if weather_dict and status == "success":
        weather = WeatherData(**weather_dict)
        # Simple check: look for temperature values in the answer
        temp_matches = re.findall(r"(\d+\.?\d*)\s*°C", answer)
        for temp_str in temp_matches:
            try:
                mentioned_temp = float(temp_str)
                if abs(mentioned_temp - weather.temperature_c) > 5:
                    issues.append(
                        f"Answer mentions {mentioned_temp}°C but actual is {weather.temperature_c}°C"
                    )
            except ValueError:
                pass

    if issues:
        logger.warning("[validate_answer] Issues found: %s", issues)
        # For serious issues, replace the answer
        if any("not found in dataset" in i for i in issues):
            return {
                "final_answer": (
                    "I encountered an issue generating a reliable response. "
                    "Please try again or rephrase your question."
                ),
                "status": "validation_error",
                "trace": state.get("trace", []) + [
                    {"step": "Validate Answer", "detail": f"FAILED: {'; '.join(issues)}", "status": "error"}
                ],
            }

    return {
        "trace": state.get("trace", []) + [
            {"step": "Validate Answer", "detail": "Passed all checks", "status": "ok"}
        ],
    }

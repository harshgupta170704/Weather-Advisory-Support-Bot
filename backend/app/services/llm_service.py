"""LLM service — provider-agnostic wrapper for OpenAI / Anthropic.

The LLM only does two things here:
  1. Parse what the user is asking (structured intent extraction)
  2. Write a nice-sounding response based on facts we give it

It never gets to decide if something is safe — that's the policy
engine's job. We basically treat it as a fancy text-in, text-out tool.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from backend.app.config import settings
from backend.app.models import ParsedIntent, WeatherData

logger = logging.getLogger("climaguard.llm")


def get_chat_model() -> Any:
    """Create the appropriate LangChain chat model based on config."""
    provider = settings.llm_provider.lower()

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.resolved_model,
            anthropic_api_key=settings.anthropic_api_key,
            temperature=0,
            max_tokens=1024,
        )
    elif provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model_name=settings.resolved_model,
            groq_api_key=settings.groq_api_key,
            temperature=0,
            max_tokens=1024,
        )
    else:
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.resolved_model,
            openai_api_key=settings.openai_api_key,
            temperature=0,
            max_tokens=1024,
        )


# ── Intent Parsing ──────────────────────────────────────────

INTENT_SYSTEM_PROMPT = """You are an intent parser for a weather advisory system. Your ONLY job is to extract structured information from user messages.

You MUST output ONLY valid JSON with these fields:
{
  "activity": "<specific activity like cycling, running, picnic, walking, park visit>",
  "activity_category": "<one of: outdoor_exercise, travel, leisure, vulnerable_groups>",
  "audience": "<one of: general, children, elderly, pets>",
  "location": "<city name if mentioned, empty string if not>",
  "time_window": "<one of: current, morning, afternoon, evening, tonight, tomorrow_morning, tomorrow_afternoon, tomorrow_evening>"
}

Rules:
- Extract what the user actually said. Do NOT add information.
- If no location is mentioned, set location to "".
- If no specific time is mentioned, set time_window to "current".
- If the user mentions kids/children/son/daughter, set audience to "children".
- If the user mentions elderly/parents/grandparents, set audience to "elderly".
- If the user mentions pets/dog/cat, set audience to "pets".
- Map "bike ride", "cycle", "biking" → activity: "cycling"
- Map "picnic", "park lunch", "eat outside" → activity: "picnic"
- Map "walk", "stroll" → activity: "walking"
- Map "jog", "run" → activity: "running"
- Map "commute", "travel", "go to work" → activity: "commute"
- Output ONLY the JSON object, nothing else."""


async def parse_user_intent(
    query: str,
    previous_context: dict[str, str] | None = None,
) -> ParsedIntent:
    """Use the LLM to extract structured intent from user query.

    If previous_context is provided, it supplies fallback values
    for fields the user didn't re-specify (session memory).
    """
    model = get_chat_model()

    context_note = ""
    if previous_context:
        context_note = f"""

Previous conversation context (use as fallback for missing fields):
- Previous activity: {previous_context.get('activity', '')}
- Previous location: {previous_context.get('location', '')}
- Previous audience: {previous_context.get('audience', 'general')}
"""

    messages = [
        SystemMessage(content=INTENT_SYSTEM_PROMPT),
        HumanMessage(content=f"User message: \"{query}\"{context_note}"),
    ]

    try:
        response = await model.ainvoke(messages)
        content = response.content.strip()

        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r"\{[^{}]+\}", content, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
        else:
            parsed = json.loads(content)

        intent = ParsedIntent(
            activity=parsed.get("activity", ""),
            activity_category=parsed.get("activity_category", ""),
            audience=parsed.get("audience", "general"),
            location=parsed.get("location", ""),
            time_window=parsed.get("time_window", "current"),
            original_query=query,
        )

        # Apply session fallbacks for missing fields
        if previous_context:
            if not intent.location and previous_context.get("location"):
                intent.location = previous_context["location"]
            if not intent.activity and previous_context.get("activity"):
                intent.activity = previous_context["activity"]
            if intent.audience == "general" and previous_context.get("audience", "general") != "general":
                intent.audience = previous_context["audience"]

        logger.info("Parsed intent: %s", intent.model_dump())
        return intent

    except Exception as exc:
        logger.error("Intent parsing failed: %s", exc)
        # Return a best-effort intent rather than crashing
        return ParsedIntent(
            activity="outdoor",
            activity_category="leisure",
            location=previous_context.get("location", "") if previous_context else "",
            original_query=query,
        )


# ── Answer Composition ──────────────────────────────────────

COMPOSE_SYSTEM_PROMPT = """You are a helpful, friendly weather advisory assistant called ClimaGuard. 

CRITICAL RULES:
1. Use ONLY the weather data provided below. Do NOT invent any weather values (temperature, wind, rain, etc.).
2. If an SOP policy is provided, mention the SOP ID and summarize its pre-filled advice naturally.
3. Reference the actual numeric values from the weather data in your response to ground it in reality.
4. If NO SOP matched, that usually means there are no severe weather alerts for this activity! In this case, cheerfully summarize the weather and say it looks like a great day to go out, but clarify you are just basing this on the lack of active weather warnings.
5. NEVER invent new SOPs or claim an SOP exists if none was provided.
6. Keep your response conversational and concise (2-4 sentences)."""


def build_compose_prompt(
    weather: WeatherData,
    policy_decision: dict[str, Any],
    parsed_intent: dict[str, Any],
    user_query: str,
) -> str:
    """Build the factual prompt for answer composition.

    The weather sentence is built DETERMINISTICALLY here,
    not by the LLM.
    """
    # Deterministic weather facts string
    weather_facts = f"""WEATHER DATA (from Open-Meteo — these are the ONLY facts you may use):
- Temperature: {weather.temperature_c}°C
- Precipitation: {weather.precipitation_mm} mm
- Precipitation Probability: {weather.precipitation_probability}%
- Wind Speed: {weather.wind_speed_kmh} km/h
- Wind Gusts: {weather.wind_gusts_kmh} km/h
- UV Index: {weather.uv_index}
- Observation Time: {weather.observed_at}
- Time Window: {weather.requested_window}"""

    selected = policy_decision.get("selected_sop")
    if selected:
        sop = selected["sop"]
        # Fill in the advice template with actual weather values
        advice_text = sop["advice"]
        advice_text = advice_text.replace("{temperature_c}", str(weather.temperature_c))
        advice_text = advice_text.replace("{precipitation_mm}", str(weather.precipitation_mm))
        advice_text = advice_text.replace("{precipitation_probability}", str(weather.precipitation_probability))
        advice_text = advice_text.replace("{wind_speed_kmh}", str(weather.wind_speed_kmh))
        advice_text = advice_text.replace("{wind_gusts_kmh}", str(weather.wind_gusts_kmh))
        advice_text = advice_text.replace("{uv_index}", str(weather.uv_index))

        policy_text = f"""SELECTED POLICY:
- SOP ID: {sop['id']}
- Title: {sop['title']}
- Severity: {sop['severity']}
- Reason: {sop['reason']}
- Pre-filled Advice: {advice_text}
- Matched Conditions: {selected.get('matched_conditions', {})}"""
    else:
        policy_text = "NO POLICY MATCHED. You must tell the user you have no applicable policy for this scenario. Do NOT make up safety advice."

    intent_text = f"""USER INTENT:
- Activity: {parsed_intent.get('activity', 'unknown')}
- Category: {parsed_intent.get('activity_category', 'unknown')}
- Audience: {parsed_intent.get('audience', 'general')}
- Location: {parsed_intent.get('location', 'unknown')}"""

    return f"""{weather_facts}

{policy_text}

{intent_text}

USER QUESTION: "{user_query}"

Compose a helpful, conversational response. Include the actual weather numbers and reference the SOP if one matched. Keep it concise."""


async def compose_answer(
    weather: WeatherData,
    policy_decision: dict[str, Any],
    parsed_intent: dict[str, Any],
    user_query: str,
) -> str:
    """Use the LLM to compose the final human-readable answer.

    The LLM receives only structured facts — it cannot invent weather or SOPs.
    """
    model = get_chat_model()
    prompt = build_compose_prompt(weather, policy_decision, parsed_intent, user_query)

    messages = [
        SystemMessage(content=COMPOSE_SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ]

    try:
        response = await model.ainvoke(messages)
        return response.content.strip()
    except Exception as exc:
        logger.error("Answer composition failed: %s", exc)
        # Deterministic fallback — never leave the user without a response
        selected = policy_decision.get("selected_sop")
        if selected:
            sop = selected["sop"]
            return (
                f"Based on current conditions in the area "
                f"(temperature {weather.temperature_c}°C, "
                f"wind {weather.wind_speed_kmh} km/h, "
                f"precipitation {weather.precipitation_mm} mm), "
                f"policy {sop['id']} ({sop['title']}) applies. "
                f"Severity: {sop['severity']}. {sop['fallback_message']}"
            )
        return (
            "I was unable to generate a detailed response, but here are the "
            f"current conditions: {weather.temperature_c}°C, "
            f"wind {weather.wind_speed_kmh} km/h, "
            f"precipitation probability {weather.precipitation_probability}%. "
            "No specific policy was triggered for your activity."
        )

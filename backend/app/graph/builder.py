"""LangGraph pipeline — stitches all the nodes together.

The graph has real branching: if location fails, we skip weather+SOPs
and go straight to an error response. Same for weather failures. This
isn't a linear chain pretending to be a graph — the conditional edges
actually matter.
"""

from __future__ import annotations

import logging

from langgraph.graph import END, StateGraph

from app.graph.nodes import (
    compose_answer_node,
    evaluate_sops_node,
    fetch_weather,
    parse_question,
    resolve_location,
    resolve_match,
    validate_answer,
)
from app.graph.state import WeatherAdvisorState

logger = logging.getLogger("climaguard.graph")


def _route_after_parse(state: WeatherAdvisorState) -> str:
    """Branch after intent parsing for chit-chat."""
    if state.get("is_chit_chat"):
        return "compose_answer"
    return "resolve_location"


def _route_after_location(state: WeatherAdvisorState) -> str:
    """Branch after location resolution."""
    if state.get("status") == "location_error":
        return "compose_answer"
    return "fetch_weather"


def _route_after_weather(state: WeatherAdvisorState) -> str:
    """Branch after weather fetch."""
    if state.get("status") == "weather_error":
        return "compose_answer"
    return "evaluate_sops"


def build_graph() -> StateGraph:
    """Build and compile the ClimaGuard advisory graph."""
    graph = StateGraph(WeatherAdvisorState)

    # ── Add nodes ───────────────────────────────────────
    graph.add_node("parse_question", parse_question)
    graph.add_node("resolve_location", resolve_location)
    graph.add_node("fetch_weather", fetch_weather)
    graph.add_node("evaluate_sops", evaluate_sops_node)
    graph.add_node("resolve_match", resolve_match)
    graph.add_node("compose_answer", compose_answer_node)
    graph.add_node("validate_answer", validate_answer)

    # ── Define edges ────────────────────────────────────
    graph.set_entry_point("parse_question")

    # Conditional: parse -> compose (chit-chat) OR location
    graph.add_conditional_edges(
        "parse_question",
        _route_after_parse,
        {"compose_answer": "compose_answer", "resolve_location": "resolve_location"}
    )

    # Conditional: location ok → fetch_weather | error → compose
    graph.add_conditional_edges(
        "resolve_location",
        _route_after_location,
        {
            "fetch_weather": "fetch_weather",
            "compose_answer": "compose_answer",
        },
    )

    # Conditional: weather ok → evaluate_sops | error → compose
    graph.add_conditional_edges(
        "fetch_weather",
        _route_after_weather,
        {
            "evaluate_sops": "evaluate_sops",
            "compose_answer": "compose_answer",
        },
    )

    # Linear: evaluate → resolve → compose → validate → END
    graph.add_edge("evaluate_sops", "resolve_match")
    graph.add_edge("resolve_match", "compose_answer")
    graph.add_edge("compose_answer", "validate_answer")
    graph.add_edge("validate_answer", END)

    return graph.compile()


# Singleton compiled graph
advisor_graph = build_graph()

"""Deterministic policy engine — the core of the whole system.

This is where all the actual safety decisions happen. The key idea is
that SOPs live in a YAML file (data/sops.yaml), so adding a new policy
is just a config change. The engine checks each SOP's conditions against
live weather, and if multiple match, picks the most severe one.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import yaml

from backend.app.models import (
    PolicyDecision,
    SOPCondition,
    SOPDefinition,
    SOPMatch,
    WeatherData,
)

logger = logging.getLogger("climaguard.policy")

# Severity ordering for resolution
SEVERITY_ORDER = {"LOW": 1, "MODERATE": 2, "HIGH": 3, "CRITICAL": 4}


def load_sops(path: str | Path) -> list[SOPDefinition]:
    """Load all SOPs from a YAML file."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"SOP file not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        raw: list[dict[str, Any]] = yaml.safe_load(f)

    sops: list[SOPDefinition] = []
    for entry in raw:
        # Convert conditions dict values to SOPCondition objects
        conditions: dict[str, SOPCondition] = {}
        for field, thresholds in entry.get("conditions", {}).items():
            if isinstance(thresholds, dict):
                conditions[field] = SOPCondition(**thresholds)
            else:
                conditions[field] = SOPCondition(gte=float(thresholds))
        entry["conditions"] = conditions
        sops.append(SOPDefinition(**entry))

    logger.info("Loaded %d SOPs from %s", len(sops), path)
    return sops


def _check_conditions(
    sop: SOPDefinition, weather: WeatherData
) -> dict[str, str] | None:
    """Check whether ALL conditions of an SOP are met by the weather data.

    Returns a dict of matched conditions with human-readable explanations,
    or None if the SOP does not match.
    """
    weather_dict = weather.model_dump()
    matched: dict[str, str] = {}

    for field, condition in sop.conditions.items():
        actual = weather_dict.get(field)
        if actual is None:
            return None  # field not available → SOP cannot match

        if condition.gte is not None and actual < condition.gte:
            return None  # below threshold
        if condition.lte is not None and actual > condition.lte:
            return None  # above threshold

        # Build human-readable match explanation
        parts = []
        if condition.gte is not None:
            parts.append(f"{actual} >= {condition.gte}")
        if condition.lte is not None:
            parts.append(f"{actual} <= {condition.lte}")
        matched[field] = " AND ".join(parts)

    return matched if matched else None


def _activity_matches(sop: SOPDefinition, activity: str, category: str, audience: str) -> bool:
    """Check whether the user's activity/category/audience matches the SOP."""
    activity_lower = activity.lower().strip()
    category_lower = category.lower().strip()
    audience_lower = audience.lower().strip()

    # Direct activity match
    sop_activities = [a.lower() for a in sop.activities]
    if activity_lower and activity_lower in sop_activities:
        return True

    # Category match (e.g., "outdoor_exercise" matches category field)
    if category_lower and category_lower == sop.category.lower():
        return True

    # Broad activity keywords — check if the user's activity is semantically
    # close to any SOP activity (substring matching for fuzzy coverage)
    if activity_lower:
        for sop_act in sop_activities:
            if sop_act in activity_lower or activity_lower in sop_act:
                return True

    # Audience-specific SOPs for vulnerable groups
    if sop.category == "vulnerable_groups":
        audience_keywords = {
            "children": ["child", "kid", "son", "daughter", "toddler", "baby", "infant"],
            "elderly": ["elderly", "old", "senior", "grandparent", "aged", "grandfather", "grandmother"],
            "pets": ["pet", "dog", "cat", "puppy"],
        }
        for group, keywords in audience_keywords.items():
            if any(kw in audience_lower for kw in keywords):
                return True
            if any(kw in activity_lower for kw in keywords):
                return True

    # Intent hints — check if any hint is loosely contained in the activity
    for hint in sop.intent_hints:
        if hint.lower() in activity_lower:
            return True

    return False


def evaluate_sops(
    sops: list[SOPDefinition],
    weather: WeatherData,
    activity: str,
    category: str,
    audience: str = "general",
) -> PolicyDecision:
    """Evaluate all SOPs against current weather and parsed intent.

    Returns a PolicyDecision with all matching SOPs ranked by severity
    then priority, with the top one selected as primary.
    """
    matches: list[SOPMatch] = []

    for sop in sops:
        # Step 1: Does the activity/category match this SOP?
        if not _activity_matches(sop, activity, category, audience):
            continue

        # Step 2: Do the weather conditions meet the SOP thresholds?
        condition_matches = _check_conditions(sop, weather)
        if condition_matches is None:
            continue

        matches.append(SOPMatch(sop=sop, matched_conditions=condition_matches))
        logger.info("SOP %s matched: %s", sop.id, condition_matches)

    if not matches:
        return PolicyDecision(
            matching_sops=[],
            selected_sop=None,
            selection_reason="No SOP conditions matched the current weather and activity.",
        )

    # Sort by severity first (CRITICAL > HIGH > ...), then priority as tiebreaker.
    # I debated doing priority-first but severity makes more sense — a CRITICAL
    # alert should always win even if it has lower priority number.
    matches.sort(
        key=lambda m: (SEVERITY_ORDER.get(m.sop.severity, 0), m.sop.priority),
        reverse=True,
    )

    selected = matches[0]
    reason_parts = [f"Selected {selected.sop.id} ({selected.sop.title})"]
    reason_parts.append(f"Severity: {selected.sop.severity}")
    reason_parts.append(f"Priority: {selected.sop.priority}")
    if len(matches) > 1:
        others = ", ".join(m.sop.id for m in matches[1:])
        reason_parts.append(f"Also matched: {others}")
        reason_parts.append("Resolved by highest severity, then highest priority.")

    return PolicyDecision(
        matching_sops=matches,
        selected_sop=selected,
        selection_reason=" | ".join(reason_parts),
    )

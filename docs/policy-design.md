# ClimaGuard — Policy Design

## Philosophy

ClimaGuard's central design principle is: **the LLM does not decide weather safety.** All safety decisions are made by a deterministic policy engine that evaluates structured rules (SOPs) against live weather data.

## SOP Structure

SOPs are defined in `data/sops.yaml`. Each SOP has:

```yaml
- id: "SOP-001"                    # Unique identifier
  title: "Strong Winds — Cycling"  # Human-readable title
  category: "outdoor_exercise"     # Broad category
  severity: "HIGH"                 # LOW | MODERATE | HIGH | CRITICAL
  priority: 90                     # Numeric priority (higher = more important)
  description: "..."               # Why this policy exists
  activities:                      # Matching activities
    - cycling
    - biking
  intent_hints:                    # Natural language hints for matching
    - ride my bike
    - cycle to work
  conditions:                      # Weather thresholds (ALL must be met)
    wind_speed_kmh:
      gte: 40                     # Greater than or equal
  advice: "..."                   # Template with {weather_field} placeholders
  fallback_message: "..."         # Short fallback if LLM is unavailable
  reason: "..."                   # Why this SOP was triggered
```

## Categories

| Category | Description | Example Activities |
|----------|-------------|-------------------|
| `outdoor_exercise` | Physical activity outdoors | cycling, running, walking, hiking |
| `travel` | Transportation and commuting | commute, two-wheeler, driving |
| `leisure` | Casual outdoor activities | picnic, park visit, garden party |
| `vulnerable_groups` | Activities involving children, elderly, pets | playground, walk with child |

## Severity Levels

| Level | Meaning | Use When |
|-------|---------|----------|
| `LOW` | Conditions warrant awareness | Mild inconvenience, precautions recommended |
| `MODERATE` | Conditions may affect comfort/safety | Significant weather impact, preparation needed |
| `HIGH` | Conditions are likely unsafe | Strong recommendation against the activity |
| `CRITICAL` | Conditions are dangerous | Activity should not proceed |

## Current SOPs (15)

| ID | Title | Category | Severity | Key Condition |
|----|-------|----------|----------|---------------|
| SOP-001 | Strong Winds — Cycling & Two-Wheelers | outdoor_exercise | HIGH | wind ≥ 40 km/h |
| SOP-002 | Very High UV — Outdoor Exercise | outdoor_exercise | HIGH | UV ≥ 8 |
| SOP-003 | High Precipitation Probability — Travel | travel | MODERATE | rain prob ≥ 70% |
| SOP-004 | Active Heavy Rainfall — Outdoor Activities | outdoor_exercise | CRITICAL | precip ≥ 10 mm |
| SOP-005 | Extreme Heat — Children Outdoors | vulnerable_groups | HIGH | temp ≥ 38°C |
| SOP-006 | Extreme Heat — Elderly Outdoors | vulnerable_groups | HIGH | temp ≥ 36°C |
| SOP-007 | Very Low Temperature — Vulnerable Groups | vulnerable_groups | HIGH | temp ≤ 5°C |
| SOP-008 | Strong Wind Gusts — Park & Family | leisure | MODERATE | gusts ≥ 50 km/h |
| SOP-009 | Rain — Picnic & Outdoor Leisure | leisure | MODERATE | precip ≥ 2 mm |
| SOP-010 | Rain — Outdoor Exercise | outdoor_exercise | LOW | precip ≥ 1 mm + prob ≥ 50% |
| SOP-011 | Moderate Wind — Cycling Advisory | outdoor_exercise | LOW | wind ≥ 25 km/h |
| SOP-012 | High UV — Casual Outdoor Time | leisure | MODERATE | UV ≥ 6 |
| SOP-013 | Combined Adverse — General Outdoor | outdoor_exercise | HIGH | temp ≥ 35°C + wind ≥ 30 km/h |
| SOP-014 | Moderate Rain — Two-Wheeler Commute | travel | LOW | rain prob ≥ 40% |
| SOP-015 | Extreme Cold — Outdoor Exercise | outdoor_exercise | MODERATE | temp ≤ 3°C |

## Matching Strategy

### Step A: Intent Extraction (LLM)
The LLM converts natural language into structured intent:
```json
{ "activity": "cycling", "category": "outdoor_exercise", "audience": "general" }
```

### Step B: Activity Matching (Deterministic)
For each SOP, check if:
1. The parsed `activity` matches any entry in the SOP's `activities` list
2. The parsed `category` matches the SOP's `category`
3. Substring matching catches partial matches (e.g., "bike" in "biking")
4. Audience-specific matching for vulnerable groups (children, elderly, pets)

### Step C: Condition Evaluation (Deterministic)
For each activity-matched SOP, check if ALL `conditions` are satisfied:
- `gte`: weather value must be ≥ threshold
- `lte`: weather value must be ≤ threshold
- All conditions use AND logic (every condition must be met)

### Step D: Conflict Resolution (Deterministic)
When multiple SOPs match:
1. Sort by severity (CRITICAL > HIGH > MODERATE > LOW)
2. Break ties by priority (higher number wins)
3. Select the top result as the primary SOP
4. Retain others as "also matched" for the trace

## How to Add SOP-016

**No code changes required.** Simply edit `data/sops.yaml`:

```yaml
- id: "SOP-016"
  title: "Fog — Driving Advisory"
  category: "travel"
  severity: "MODERATE"
  priority: 66
  description: >
    Fog reduces visibility and makes driving conditions hazardous.
  activities:
    - driving
    - commute
    - travel
    - road_trip
  intent_hints:
    - drive to work
    - road trip
    - can I drive
  conditions:
    # Note: this requires visibility data from the weather API.
    # If the field isn't fetched, this SOP will never match —
    # which is the correct safe behavior.
    wind_speed_kmh:
      lte: 10
    temperature_c:
      lte: 8
  advice: >
    Driving conditions may be challenging. Temperature is {temperature_c}°C
    with very low wind ({wind_speed_kmh} km/h), which can indicate fog
    formation. Drive slowly, use fog lights, and increase following distance.
  fallback_message: "Possible fog — drive with caution."
  reason: "Low temperature and calm wind conditions suggest potential fog."
```

Restart the server and the new SOP is automatically loaded and evaluated.

## Limitations

1. **Condition fields must exist in WeatherData**: An SOP can only use fields that the weather service actually fetches (`temperature_c`, `precipitation_mm`, `precipitation_probability`, `wind_speed_kmh`, `wind_gusts_kmh`, `uv_index`).

2. **AND-only logic**: All conditions in an SOP must be met simultaneously. There's no OR operator for conditions within a single SOP (but multiple SOPs can cover OR scenarios).

3. **No time-of-day conditions**: SOPs don't specify "only apply during afternoon." The time window affects which weather data is used, but the SOP conditions evaluate the same way.

4. **Activity matching is keyword-based**: While the LLM helps with semantic understanding, the final match relies on keyword/category matching. Very unusual phrasings might not match.

5. **Severity is static**: The severity of an SOP doesn't scale with how far the weather exceeds the threshold. "Wind at 41 km/h" and "wind at 80 km/h" both trigger the same HIGH SOP-001.

"""ClimaGuard — Open-Meteo weather & geocoding client.

All weather facts originate here. The LLM never invents weather data.
Supports dependency injection for testing via WeatherClientProtocol.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone

import httpx

from backend.app.models import LocationData, WeatherData

logger = logging.getLogger("climaguard.weather")

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

TIMEOUT = 10.0  # seconds


class WeatherClientProtocol(ABC):
    """Protocol so tests can inject a mock weather client."""

    @abstractmethod
    async def resolve_location(self, name: str) -> LocationData:
        ...

    @abstractmethod
    async def fetch_weather(
        self, lat: float, lon: float, time_window: str = "current"
    ) -> WeatherData:
        ...


class LocationResolutionError(Exception):
    pass


class WeatherFetchError(Exception):
    pass


class WeatherDataValidationError(Exception):
    pass


class OpenMeteoClient(WeatherClientProtocol):
    """Production client that calls the Open-Meteo APIs."""

    def __init__(self) -> None:
        self._http = httpx.AsyncClient(timeout=TIMEOUT)

    async def resolve_location(self, name: str) -> LocationData:
        """Geocode a city name via Open-Meteo."""
        logger.info("Resolving location: %s", name)
        try:
            resp = await self._http.get(
                GEOCODING_URL, params={"name": name, "count": 1, "language": "en"}
            )
            resp.raise_for_status()
            data = resp.json()
        except httpx.TimeoutException:
            raise LocationResolutionError(f"Geocoding request timed out for '{name}'")
        except httpx.HTTPStatusError as exc:
            raise LocationResolutionError(
                f"Geocoding returned HTTP {exc.response.status_code} for '{name}'"
            )
        except Exception as exc:
            raise LocationResolutionError(f"Geocoding failed for '{name}': {exc}")

        results = data.get("results")
        if not results:
            raise LocationResolutionError(
                f"No location found for '{name}'. Please check the spelling or try a different city."
            )

        hit = results[0]
        return LocationData(
            city=hit.get("name", name),
            country=hit.get("country", "Unknown"),
            latitude=hit["latitude"],
            longitude=hit["longitude"],
        )

    async def fetch_weather(
        self, lat: float, lon: float, time_window: str = "current"
    ) -> WeatherData:
        """Fetch current (and optionally hourly) weather from Open-Meteo."""
        logger.info("Fetching weather for (%.4f, %.4f) window=%s", lat, lon, time_window)
        params: dict = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,uv_index",
            "hourly": "temperature_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,uv_index",
            "timezone": "auto",
            "forecast_days": 2,
        }

        try:
            resp = await self._http.get(FORECAST_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
        except httpx.TimeoutException:
            raise WeatherFetchError("Weather API request timed out")
        except httpx.HTTPStatusError as exc:
            raise WeatherFetchError(f"Weather API returned HTTP {exc.response.status_code}")
        except Exception as exc:
            raise WeatherFetchError(f"Weather API request failed: {exc}")

        # ── Validate response structure ──────────────────────
        current = data.get("current")
        if not current:
            raise WeatherDataValidationError("Weather response missing 'current' block")

        # ── If a specific time window is requested, pull from hourly data ──
        if time_window not in ("current", "now", ""):
            weather = self._extract_hourly(data, time_window)
            if weather:
                return weather

        # ── Default: use current data ────────────────────────
        return self._parse_current(current)

    def _parse_current(self, current: dict) -> WeatherData:
        """Parse the 'current' block of the Open-Meteo response."""
        try:
            return WeatherData(
                temperature_c=float(current.get("temperature_2m", 0)),
                precipitation_mm=float(current.get("precipitation", 0)),
                precipitation_probability=float(current.get("precipitation_probability", 0)),
                wind_speed_kmh=float(current.get("wind_speed_10m", 0)),
                wind_gusts_kmh=float(current.get("wind_gusts_10m", 0)),
                uv_index=float(current.get("uv_index", 0)),
                observed_at=current.get("time", datetime.now(timezone.utc).isoformat()),
                requested_window="current",
            )
        except (TypeError, ValueError) as exc:
            raise WeatherDataValidationError(f"Could not parse weather values: {exc}")

    def _extract_hourly(self, data: dict, window: str) -> WeatherData | None:
        """Extract average weather for a named time window from hourly data."""
        hourly = data.get("hourly")
        if not hourly or "time" not in hourly:
            return None

        times: list[str] = hourly["time"]
        now = datetime.now()

        # Determine target hour range
        hour_ranges = {
            "morning": (6, 11),
            "tomorrow_morning": (6, 11),
            "afternoon": (12, 16),
            "evening": (17, 21),
            "tonight": (19, 23),
            "night": (20, 23),
        }
        start_h, end_h = hour_ranges.get(window, (now.hour, now.hour + 3))

        # For "tomorrow" windows, look at the next day
        target_date = now.date()
        if "tomorrow" in window:
            from datetime import timedelta
            target_date = now.date() + timedelta(days=1)

        indices = []
        for i, t in enumerate(times):
            try:
                dt = datetime.fromisoformat(t)
                if dt.date() == target_date and start_h <= dt.hour <= end_h:
                    indices.append(i)
            except ValueError:
                continue

        if not indices:
            return None

        def _avg(field: str) -> float:
            vals = [float(hourly[field][i]) for i in indices if hourly.get(field) and i < len(hourly[field]) and hourly[field][i] is not None]
            return round(sum(vals) / len(vals), 1) if vals else 0.0

        def _max(field: str) -> float:
            vals = [float(hourly[field][i]) for i in indices if hourly.get(field) and i < len(hourly[field]) and hourly[field][i] is not None]
            return round(max(vals), 1) if vals else 0.0

        return WeatherData(
            temperature_c=_avg("temperature_2m"),
            precipitation_mm=_max("precipitation"),
            precipitation_probability=_max("precipitation_probability"),
            wind_speed_kmh=_max("wind_speed_10m"),
            wind_gusts_kmh=_max("wind_gusts_10m"),
            uv_index=_max("uv_index"),
            observed_at=times[indices[0]] if indices else "",
            requested_window=window,
        )

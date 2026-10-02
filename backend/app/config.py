"""App configuration — loads everything from .env"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Loads configuration from environment / .env file."""

    # LLM
    llm_provider: str = "openai"
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    llm_model: Optional[str] = None

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Logging
    log_level: str = "INFO"

    # Paths
    sop_file: str = "data/sops.yaml"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def resolved_model(self) -> str:
        """Return the model name to use, with sensible defaults."""
        if self.llm_model:
            return self.llm_model
        if self.llm_provider == "anthropic":
            return "claude-sonnet-4-20250514"
        if self.llm_provider == "groq":
            return "openai/gpt-oss-120b"
        return "gpt-4o-mini"


settings = Settings()

from app.services.extraction.base import ExtractorStrategy
from app.services.extraction.demo import DemoExtractor
from app.services.extraction.rule_based import RuleBasedExtractor
from app.services.extraction.llm import LLMExtractor
from app.core.config import settings


class ExtractorFactory:
    @staticmethod
    def get_extractor(filename: str = "", force_demo: bool = False) -> ExtractorStrategy:
        """
        Factory method to select the optimal extraction strategy.
        If force_demo is True or the file is the bundled demo agreement, return DemoExtractor.
        Otherwise, if LLM is configured, return LLMExtractor (with rule-based fallback).
        Otherwise, return RuleBasedExtractor.
        """
        if force_demo or "demo_agreement" in filename.lower() or "residential rental" in filename.lower():
            return DemoExtractor()

        if settings.LLM_API_KEY and settings.LLM_PROVIDER.lower() in ["openai", "custom"]:
            return LLMExtractor(fallback_extractor=RuleBasedExtractor())

        return RuleBasedExtractor()

import os
import json
from typing import List, Dict, Any, Tuple
import httpx
from app.services.extraction.base import ExtractorStrategy
from app.services.extraction.rule_based import RuleBasedExtractor
from app.core.config import settings


class LLMExtractor(ExtractorStrategy):
    """
    LLM-powered extractor using OpenAI-compatible JSON structured completion.
    Falls back gracefully to RuleBasedExtractor if no API key is available or if request fails.
    """

    def __init__(self, fallback_extractor: ExtractorStrategy = None):
        self.fallback = fallback_extractor or RuleBasedExtractor()

    def extract(
        self, contract_text: str, pages_data: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        if not settings.LLM_API_KEY or settings.LLM_PROVIDER == "none":
            # Direct fallback when no key is set
            return self.fallback.extract(contract_text, pages_data)

        prompt = f"""
You are an expert contract obligation analysis engine.
Extract the parties, segmented clauses, and structured obligations from the following contract text.
For each obligation, specify:
- actor (e.g. Tenant, Landlord, Service Provider)
- action (short verb phrase)
- object (what the action applies to)
- amount (if any, e.g. ₹20,000)
- frequency (Monthly, One-time, As needed, etc.)
- trigger (event that initiates the obligation)
- condition (preconditions or exceptions)
- deadline_text (verbatim deadline)
- normalized_deadline (structured description)
- consequence (penalties, late fees, default)
- confidence (0.0 to 1.0)
- evidence_text (verbatim sentence)
- source_page (page number)

Contract Text:
{contract_text[:12000]}

Return pure JSON with keys: "parties", "clauses", "obligations".
"""
        try:
            headers = {
                "Authorization": f"Bearer {settings.LLM_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": settings.LLM_MODEL,
                "messages": [
                    {"role": "system", "content": "You extract structured legal obligations into JSON."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"}
            }

            with httpx.Client(timeout=30.0) as client:
                resp = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    return (
                        parsed.get("parties", []),
                        parsed.get("clauses", []),
                        parsed.get("obligations", [])
                    )
        except Exception as e:
            print(f"[LLMExtractor] External API call failed or timed out: {e}. Falling back to RuleBasedExtractor.")

        # Seamless fallback
        return self.fallback.extract(contract_text, pages_data)

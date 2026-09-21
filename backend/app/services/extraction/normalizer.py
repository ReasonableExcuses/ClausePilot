import re
from typing import Optional, Tuple


class ObligationNormalizer:
    @staticmethod
    def normalize_deadline(text: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        """
        Normalizes natural language deadline text into a structured normalized string and frequency.
        Returns (normalized_deadline, frequency)
        """
        if not text:
            return (None, None)

        clean = text.strip()
        lower = clean.lower()

        # Recurring monthly patterns
        if re.search(r"(\d+)(?:st|nd|rd|th)?\s*(?:day)?\s*of\s*(?:each|every)\s*(?:calendar\s*)?month", lower):
            m = re.search(r"(\d+)", lower)
            day = m.group(1) if m else "5"
            return (f"Day {day} of every month", "Monthly")

        if "monthly" in lower or "each month" in lower or "every month" in lower:
            return ("Recurring monthly", "Monthly")

        # Relative days patterns
        if "within 30 days" in lower:
            if "surrender" in lower or "termination" in lower or "handover" in lower or "end" in lower:
                return ("Tenancy end date + 30 days", "One-time")
            return ("Trigger + 30 days", "One-time")

        if "within 7 days" in lower:
            if "bill" in lower or "invoice" in lower:
                return ("Bill receipt + 7 days", "Per invoice")
            if "notification" in lower or "notice" in lower or "report" in lower:
                return ("Notice date + 7 days", "As needed")
            return ("Trigger + 7 days", "As needed")

        if "within 15 days" in lower:
            return ("Dispute notice + 15 days", "As needed")

        if "at least 30 days prior" in lower or "30 days before" in lower or "at least 30 days" in lower:
            return ("Termination date - 30 days", "One-time")

        if "24 hours" in lower:
            return ("Inspection time - 24 hours", "Per inspection")

        if "12:00 pm" in lower or "noon" in lower:
            return ("Final day 12:00 PM", "One-time")

        if "signing" in lower or "execution" in lower:
            return ("Contract signing date", "One-time")

        if "throughout" in lower or "ongoing" in lower or "duration" in lower:
            return ("Continuous lease term", "Continuous")

        return (clean, "As needed")

    @staticmethod
    def extract_attention_flags(clause_title: str, clause_text: str, obligations: list) -> list:
        """
        Generates document attention flags for explainability without legal advice.
        """
        flags = []

        # Check for conditional obligations
        conditional_obls = [o for o in obligations if o.get("condition")]
        if conditional_obls:
            flags.append({
                "id": f"flag-cond-{len(flags)+1}",
                "type": "conditional_duty",
                "title": "Conditional Duty Detected",
                "description": f"Contains {len(conditional_obls)} obligation(s) subject to preconditions or exceptions.",
                "severity": "info"
            })

        # Check for penalty or late fee
        if re.search(r"(late fee|penalty|interest|forfeit|charge of ₹)", clause_text, re.IGNORECASE):
            flags.append({
                "id": f"flag-fin-{len(flags)+1}",
                "type": "high_financial_impact",
                "title": "Financial Consequence or Penalty",
                "description": "Specifies monetary penalties, late fees, or forfeiture terms upon default.",
                "severity": "warning"
            })

        # Check for strict deadlines
        if re.search(r"(within 24 hours|within 7 days|immediately|shall not)", clause_text, re.IGNORECASE):
            flags.append({
                "id": f"flag-dead-{len(flags)+1}",
                "type": "strict_deadline",
                "title": "Time-Sensitive Requirement",
                "description": "Contains tight timelines or immediate performance requirements.",
                "severity": "warning"
            })

        # Check for low confidence extractions
        low_conf = [o for o in obligations if o.get("confidence", 1.0) < 0.75]
        if low_conf:
            flags.append({
                "id": f"flag-conf-{len(flags)+1}",
                "type": "low_confidence",
                "title": "Needs Review",
                "description": "Extraction certainty is below 75%; human verification recommended.",
                "severity": "caution"
            })

        return flags

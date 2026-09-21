import re
from typing import List, Dict, Any, Tuple
from app.services.extraction.base import ExtractorStrategy
from app.services.extraction.normalizer import ObligationNormalizer


class RuleBasedExtractor(ExtractorStrategy):
    """
    Robust rule-based heuristic extractor utilizing regex patterns, deontic modal detection,
    party identification, temporal markers, and syntax parsing.
    """

    KNOWN_ACTORS = [
        "Tenant", "Landlord", "Service Provider", "Client", "Customer",
        "Buyer", "Seller", "Employer", "Employee", "Contractor",
        "Licensee", "Licensor", "Lessor", "Lessee", "Borrower", "Lender",
        "Either party", "Both parties", "Party"
    ]

    MODAL_PATTERNS = re.compile(
        r"\b(shall|must|agrees to|is required to|are required to|will pay|undertakes to|responsible for|agrees not to|shall not|must not)\b",
        re.IGNORECASE
    )

    DEADLINE_PATTERNS = [
        r"(?:on\s+or\s+before|by|no\s+later\s+than)\s+(?:the\s+)?(\d+(?:st|nd|rd|th)?(?:\s+day)?\s+of\s+(?:each|every)\s+(?:calendar\s+)?month)",
        r"(?:within)\s+(\d+\s*(?:business\s+)?(?:days|hours|weeks|months))(?:\s+of|\s+following|\s+after)?",
        r"(?:at\s+least)\s+(\d+\s*(?:days|hours|weeks|months))\s+(?:prior|before)",
        r"(?:by)\s+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))",
        r"(?:upon)\s+(?:execution|signing|termination)",
    ]

    TRIGGER_PATTERNS = [
        r"(?:in\s+the\s+event\s+of|upon|following|after|in\s+case\s+of|on\s+receipt\s+of)\s+([A-Za-z0-9\s,–\-]{5,50}?)(?=[,\.]|\s+the\s+|\s+shall\s+|\s+Tenant\s+|\s+Landlord\s+)",
        r"(?:prior\s+to|before)\s+([A-Za-z0-9\s,–\-]{5,40}?)(?=[,\.]|\s+the\s+|\s+shall\s+)",
    ]

    CONDITION_PATTERNS = [
        r"(?:subject\s+to|provided\s+that|unless|conditional\s+upon)\s+([A-Za-z0-9\s,–\-]{5,80}?)(?=[,\.]|\s+the\s+)",
    ]

    CONSEQUENCE_PATTERNS = [
        r"(?:late\s+(?:payment\s+)?fee|penalty|holding\s+over\s+charge|forfeit|interest\s+penalty|termination|liquidated\s+damages)(?:\s+of)?\s+([A-Za-z0-9₹\$,\s\.\/]{3,60}?)(?=[,\.]|$)",
    ]

    AMOUNT_PATTERN = re.compile(r"(?:₹|Rs\.?|INR|\$|USD)\s*[\d,]+(?:\.\d{2})?(?:\s*(?:per\s+day|\/day|\/month|monthly))?", re.IGNORECASE)

    def extract(
        self, contract_text: str, pages_data: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        # 1. Detect parties
        parties = self._detect_parties(contract_text)

        # 2. Segment clauses
        clauses = self._segment_clauses(pages_data, contract_text)

        # 3. Extract obligations per clause
        obligations = []
        enriched_clauses = []

        for clause in clauses:
            clause_obls = self._extract_obligations_from_clause(clause, parties)
            flags = ObligationNormalizer.extract_attention_flags(
                clause["title"], clause["text"], clause_obls
            )
            c_copy = dict(clause)
            c_copy["attention_flags"] = flags
            c_copy["obligation_count"] = len(clause_obls)
            enriched_clauses.append(c_copy)
            obligations.extend(clause_obls)

        return parties, enriched_clauses, obligations

    def _detect_parties(self, text: str) -> List[Dict[str, str]]:
        parties = []
        found_names = set()

        # Look for "between [Name] ('Landlord') and [Name] ('Tenant')"
        matches = re.findall(
            r"(?:Mr\.|Ms\.|Mrs\.|Dr\.)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s*(?:\([^\)]*referred to as (?:the\s+)?['\"]([A-Za-z]+)['\"][^\)]*\))",
            text,
            re.IGNORECASE
        )
        for name, role in matches:
            clean_name = name.strip()
            clean_role = role.strip().capitalize()
            if clean_name not in found_names:
                parties.append({"name": clean_name, "role": clean_role})
                found_names.add(clean_name)

        # Fallback if no specific names parsed
        if not parties:
            for actor in ["Tenant", "Landlord"]:
                if actor.lower() in text.lower():
                    parties.append({"name": f"{actor} (Party)", "role": actor})

        if not parties:
            parties = [
                {"name": "First Party", "role": "Party A"},
                {"name": "Second Party", "role": "Party B"},
            ]

        return parties

    def _segment_clauses(self, pages_data: List[Dict[str, Any]], full_text: str) -> List[Dict[str, Any]]:
        clauses = []
        # Pattern for "Clause 1 — Title" or "1. Title" or "Section 1"
        pattern = re.compile(
            r"(?:Clause|Section|\bARTICLE)\s*(\d+)[\s:—–\-]+([A-Za-z0-9\s,\/&'\(\)]+?)(?=\n|$)",
            re.IGNORECASE
        )

        matches = list(pattern.finditer(full_text))

        if matches:
            for i, match in enumerate(matches):
                c_num = match.group(1).strip()
                c_title = match.group(2).strip().title()
                start_pos = match.start()
                end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
                clause_text = full_text[start_pos:end_pos].strip()

                # Find page number
                page_no = 1
                char_count = 0
                for p in pages_data:
                    char_count += len(p["text"])
                    if start_pos <= char_count:
                        page_no = p["page_number"]
                        break

                # Create preview
                clean_lines = [l.strip() for l in clause_text.splitlines() if l.strip() and not l.startswith("Clause")]
                preview = clean_lines[0][:180] + "..." if clean_lines else clause_text[:180] + "..."

                clauses.append({
                    "clause_number": c_num,
                    "title": c_title,
                    "text": clause_text,
                    "page_number": page_no,
                    "preview": preview,
                })
        else:
            # Fallback segmentation by paragraphs or numbered list
            p_pattern = re.compile(r"(?:^|\n)(\d+)\.\s+([A-Za-z0-9\s,\/&'\(\)]+?)(?=\n|$)", re.MULTILINE)
            p_matches = list(p_pattern.finditer(full_text))
            if p_matches:
                for i, match in enumerate(p_matches):
                    c_num = match.group(1).strip()
                    c_title = match.group(2).strip()[:40].title()
                    start_pos = match.start()
                    end_pos = p_matches[i + 1].start() if i + 1 < len(p_matches) else len(full_text)
                    clause_text = full_text[start_pos:end_pos].strip()

                    clauses.append({
                        "clause_number": c_num,
                        "title": c_title or f"Section {c_num}",
                        "text": clause_text,
                        "page_number": 1,
                        "preview": clause_text[:180] + "...",
                    })
            else:
                # Default single block
                clauses.append({
                    "clause_number": "1",
                    "title": "General Terms and Obligations",
                    "text": full_text[:4000],
                    "page_number": 1,
                    "preview": full_text[:180] + "...",
                })

        return clauses

    def _extract_obligations_from_clause(
        self, clause: Dict[str, Any], parties: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        obligations = []
        text = clause["text"]
        sentences = re.split(r"(?<=[.!?])\s+", text)

        for sentence in sentences:
            sentence_clean = sentence.strip()
            if not sentence_clean or len(sentence_clean) < 20:
                continue

            # Check for modal/obligation trigger
            modal_match = self.MODAL_PATTERNS.search(sentence_clean)
            if not modal_match:
                continue

            # Identify actor
            actor = "Party"
            for known in self.KNOWN_ACTORS:
                if re.search(rf"\b{known}\b", sentence_clean, re.IGNORECASE):
                    actor = known.title()
                    break

            # If actor not in KNOWN_ACTORS, check party roles
            if actor == "Party" and parties:
                for p in parties:
                    if p["role"].lower() in sentence_clean.lower():
                        actor = p["role"].title()
                        break

            # Extract amount
            amount_match = self.AMOUNT_PATTERN.search(sentence_clean)
            amount = amount_match.group(0).strip() if amount_match else None

            # Extract deadline text
            deadline_text = None
            for dp in self.DEADLINE_PATTERNS:
                dm = re.search(dp, sentence_clean, re.IGNORECASE)
                if dm:
                    deadline_text = dm.group(0).strip()
                    break

            normalized_deadline, frequency = ObligationNormalizer.normalize_deadline(deadline_text)

            # Extract trigger
            trigger = None
            for tp in self.TRIGGER_PATTERNS:
                tm = re.search(tp, sentence_clean, re.IGNORECASE)
                if tm:
                    trigger = tm.group(0).strip().capitalize()
                    break

            # Extract condition
            condition = None
            for cp in self.CONDITION_PATTERNS:
                cm = re.search(cp, sentence_clean, re.IGNORECASE)
                if cm:
                    condition = cm.group(0).strip().capitalize()
                    break

            # Extract consequence
            consequence = None
            for cq in self.CONSEQUENCE_PATTERNS:
                cqm = re.search(cq, sentence_clean, re.IGNORECASE)
                if cqm:
                    consequence = cqm.group(0).strip().capitalize()
                    break

            # Extract action / verb phrase
            action_phrase = self._extract_action(sentence_clean, modal_match.group(0))

            # Calculate confidence
            confidence = 0.75
            if actor != "Party":
                confidence += 0.08
            if deadline_text:
                confidence += 0.08
            if amount:
                confidence += 0.05
            confidence = round(min(0.96, confidence), 2)

            obligations.append({
                "clause_number": clause["clause_number"],
                "actor": actor,
                "action": action_phrase,
                "object": clause["title"],
                "amount": amount,
                "frequency": frequency or "As needed",
                "trigger": trigger,
                "condition": condition,
                "deadline_text": deadline_text,
                "normalized_deadline": normalized_deadline,
                "consequence": consequence,
                "status": "Pending",
                "confidence": confidence,
                "evidence_text": sentence_clean,
                "source_page": clause["page_number"],
            })

        return obligations

    def _extract_action(self, sentence: str, modal: str) -> str:
        idx = sentence.lower().find(modal.lower())
        if idx != -1:
            rest = sentence[idx + len(modal):].strip()
            # Take first 4-8 words
            words = rest.split()
            action_words = []
            for w in words[:7]:
                if w in [",", ";", ".", "on", "in", "by", "before", "within"] and len(action_words) >= 2:
                    break
                action_words.append(w)
            action_phrase = " ".join(action_words).strip(" ,.;")
            if action_phrase:
                return action_phrase.capitalize()
        return "Perform contractual obligation"

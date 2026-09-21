from typing import List, Dict, Any
from app.models.contract import Contract


class TimelineService:
    @staticmethod
    def build_timeline(contract: Contract) -> List[Dict[str, Any]]:
        """
        Organizes obligations into chronological and categorized timeline events.
        Categories: recurring, initial, ongoing, event_driven, terminal
        """
        items = []

        clause_map = {c.id: c for c in contract.clauses}

        for idx, obl in enumerate(contract.obligations):
            clause = clause_map.get(obl.clause_id)
            c_num = clause.clause_number if clause else "General"
            c_page = clause.page_number if clause else (obl.source_page or 1)

            timing_type = "event_driven"
            order_index = 50
            time_label = obl.normalized_deadline or obl.deadline_text or "As required"

            # Classify timing type
            dl_lower = (obl.deadline_text or "").lower()
            norm_lower = (obl.normalized_deadline or "").lower()
            freq_lower = (obl.frequency or "").lower()

            if "signing" in dl_lower or "execution" in dl_lower:
                timing_type = "initial"
                order_index = 10
                time_label = "Day 1 (Contract Execution)"
            elif "monthly" in freq_lower or "every month" in norm_lower or "5th" in dl_lower:
                timing_type = "recurring"
                order_index = 20
                time_label = "5th of Every Month"
            elif "continuous" in norm_lower or "ongoing" in freq_lower or "throughout" in dl_lower:
                timing_type = "ongoing"
                order_index = 30
                time_label = "Continuous Tenancy Duration"
            elif "7 days" in dl_lower or "bill" in dl_lower:
                timing_type = "event_driven"
                order_index = 40
                time_label = "Trigger + 7 Days"
            elif "24 hours" in dl_lower:
                timing_type = "event_driven"
                order_index = 45
                time_label = "Inspection - 24 Hours Prior"
            elif "30 days prior" in dl_lower or "before termination" in dl_lower or "termination date - 30" in norm_lower:
                timing_type = "terminal"
                order_index = 70
                time_label = "30 Days Before Termination"
            elif "final day" in norm_lower or "12:00 pm" in dl_lower:
                timing_type = "terminal"
                order_index = 80
                time_label = "Final Lease Day (12:00 PM)"
            elif "after termination" in dl_lower or "following" in dl_lower or "30 days" in dl_lower:
                timing_type = "terminal"
                order_index = 90
                time_label = "Within 30 Days Post-Tenancy"

            items.append({
                "id": f"timeline-{obl.id[:8]}",
                "obligation_id": obl.id,
                "party": obl.actor,
                "action": f"{obl.action} ({obl.amount})" if obl.amount else obl.action,
                "timing_type": timing_type,
                "time_label": time_label,
                "order_index": order_index,
                "trigger": obl.trigger,
                "condition": obl.condition,
                "status": obl.status,
                "source_clause": f"Clause {c_num}: {clause.title if clause else ''}",
                "source_page": c_page,
            })

        # Sort items by order_index
        items.sort(key=lambda x: x["order_index"])
        return items

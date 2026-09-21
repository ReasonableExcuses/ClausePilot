from typing import List, Dict, Any
from app.models.contract import Contract, Clause, Obligation


class GraphService:
    @staticmethod
    def build_obligation_graph(contract: Contract) -> Dict[str, Any]:
        """
        Builds nodes and edges for React Flow visualization representing
        Clauses -> Parties -> Obligations -> Triggers -> Deadlines -> Conditions -> Consequences
        """
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        seen_node_ids = set()

        # Track distinct parties
        party_node_map = {}
        for party in contract.parties:
            p_node_id = f"party-{party.role.lower().replace(' ', '-')}"
            if p_node_id not in seen_node_ids:
                seen_node_ids.add(p_node_id)
                party_node_map[party.role.lower()] = p_node_id
                nodes.append({
                    "id": p_node_id,
                    "type": "party",
                    "label": party.name or party.role,
                    "data": {
                        "name": party.name,
                        "role": party.role,
                        "badge": "Party"
                    }
                })

        # Map clauses
        clause_map = {c.id: c for c in contract.clauses}
        clause_node_map = {}

        # Build nodes and edges for each obligation
        for i, obl in enumerate(contract.obligations):
            clause = clause_map.get(obl.clause_id)
            c_label = f"Clause {clause.clause_number}: {clause.title}" if clause else "Contract Clause"
            c_node_id = f"clause-{clause.clause_number if clause else i+1}"

            # Add clause node if not added
            if c_node_id not in seen_node_ids:
                seen_node_ids.add(c_node_id)
                clause_node_map[c_node_id] = c_node_id
                nodes.append({
                    "id": c_node_id,
                    "type": "clause",
                    "label": c_label,
                    "data": {
                        "clause_number": clause.clause_number if clause else str(i+1),
                        "title": clause.title if clause else "Clause",
                        "page_number": clause.page_number if clause else 1,
                        "preview": clause.preview if clause else "",
                        "badge": "Clause"
                    }
                })

            # Add party node if not mapped
            actor_key = obl.actor.lower()
            p_node_id = party_node_map.get(actor_key)
            if not p_node_id:
                p_node_id = f"party-{actor_key.replace(' ', '-')}"
                if p_node_id not in seen_node_ids:
                    seen_node_ids.add(p_node_id)
                    party_node_map[actor_key] = p_node_id
                    nodes.append({
                        "id": p_node_id,
                        "type": "party",
                        "label": obl.actor,
                        "data": {
                            "name": obl.actor,
                            "role": obl.actor,
                            "badge": "Party"
                        }
                    })

            # Connect Clause -> Party
            edge_cp = f"edge-{c_node_id}-{p_node_id}"
            if not any(e["id"] == edge_cp for e in edges):
                edges.append({
                    "id": edge_cp,
                    "source": c_node_id,
                    "target": p_node_id,
                    "label": "governs",
                    "animated": False
                })

            # Obligation Node
            obl_node_id = f"obl-{obl.id[:8]}"
            obl_label = f"{obl.action} ({obl.amount})" if obl.amount else obl.action
            nodes.append({
                "id": obl_node_id,
                "type": "obligation",
                "label": obl_label,
                "data": {
                    "id": obl.id,
                    "actor": obl.actor,
                    "action": obl.action,
                    "amount": obl.amount,
                    "frequency": obl.frequency,
                    "status": obl.status,
                    "confidence": obl.confidence,
                    "evidence": obl.evidence_text,
                    "source_page": obl.source_page,
                    "badge": "Obligation"
                }
            })
            seen_node_ids.add(obl_node_id)

            # Connect Party -> Obligation
            edges.append({
                "id": f"edge-{p_node_id}-{obl_node_id}",
                "source": p_node_id,
                "target": obl_node_id,
                "label": "binds",
                "animated": True
            })

            # Trigger Node & Edge
            if obl.trigger:
                trig_node_id = f"trigger-{obl.id[:8]}"
                nodes.append({
                    "id": trig_node_id,
                    "type": "trigger",
                    "label": f"Trigger: {obl.trigger}",
                    "data": {
                        "trigger": obl.trigger,
                        "badge": "Trigger"
                    }
                })
                seen_node_ids.add(trig_node_id)
                edges.append({
                    "id": f"edge-{trig_node_id}-{obl_node_id}",
                    "source": trig_node_id,
                    "target": obl_node_id,
                    "label": "initiates",
                    "animated": True
                })

            # Deadline Node & Edge
            if obl.deadline_text or obl.normalized_deadline:
                dl_label = obl.normalized_deadline or obl.deadline_text
                dl_node_id = f"deadline-{obl.id[:8]}"
                nodes.append({
                    "id": dl_node_id,
                    "type": "deadline",
                    "label": f"Deadline: {dl_label}",
                    "data": {
                        "deadline": dl_label,
                        "raw_deadline": obl.deadline_text,
                        "badge": "Deadline"
                    }
                })
                seen_node_ids.add(dl_node_id)
                edges.append({
                    "id": f"edge-{obl_node_id}-{dl_node_id}",
                    "source": obl_node_id,
                    "target": dl_node_id,
                    "label": "due by",
                    "animated": False
                })

            # Condition Node & Edge
            if obl.condition:
                cond_node_id = f"cond-{obl.id[:8]}"
                nodes.append({
                    "id": cond_node_id,
                    "type": "condition",
                    "label": f"Condition: {obl.condition[:40]}...",
                    "data": {
                        "condition": obl.condition,
                        "badge": "Condition"
                    }
                })
                seen_node_ids.add(cond_node_id)
                edges.append({
                    "id": f"edge-{obl_node_id}-{cond_node_id}",
                    "source": obl_node_id,
                    "target": cond_node_id,
                    "label": "conditioned on",
                    "animated": False
                })

            # Consequence Node & Edge
            if obl.consequence:
                conseq_node_id = f"conseq-{obl.id[:8]}"
                nodes.append({
                    "id": conseq_node_id,
                    "type": "consequence",
                    "label": f"Consequence: {obl.consequence[:40]}...",
                    "data": {
                        "consequence": obl.consequence,
                        "badge": "Consequence"
                    }
                })
                seen_node_ids.add(conseq_node_id)
                edges.append({
                    "id": f"edge-{obl_node_id}-{conseq_node_id}",
                    "source": obl_node_id,
                    "target": conseq_node_id,
                    "label": "penalty / default",
                    "animated": True
                })

        return {
            "contract_id": contract.id,
            "nodes": nodes,
            "edges": edges
        }

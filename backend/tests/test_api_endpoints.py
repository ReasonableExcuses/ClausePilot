import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_load_demo_contract():
    response = client.post("/api/contracts/demo")
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "demo_agreement.pdf"
    assert data["clause_count"] == 12
    assert data["obligation_count"] >= 9
    contract_id = data["id"]

    # Test get contract detail
    detail_res = client.get(f"/api/contracts/{contract_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["clauses"]) == 12
    assert len(detail["obligations"]) >= 9
    assert len(detail["attention_flags"]) >= 1

    # Test graph endpoint
    graph_res = client.get(f"/api/contracts/{contract_id}/graph")
    assert graph_res.status_code == 200
    graph = graph_res.json()
    assert len(graph["nodes"]) > 10
    assert len(graph["edges"]) > 10

    # Test timeline endpoint
    timeline_res = client.get(f"/api/contracts/{contract_id}/timeline")
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()
    assert len(timeline["items"]) >= 9

    # Test Q&A endpoint
    qa_res = client.post(
        f"/api/contracts/{contract_id}/ask",
        json={"question": "When is the rent due?"}
    )
    assert qa_res.status_code == 200
    qa = qa_res.json()
    assert "₹20,000" in qa["answer"] or "5th" in qa["answer"]
    assert len(qa["evidence_sources"]) >= 1

    # Test evaluation metrics endpoint
    eval_res = client.get("/api/evaluation/metrics")
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["total_samples"] >= 20
    assert eval_data["clause_detection"]["f1_score"] >= 0.90

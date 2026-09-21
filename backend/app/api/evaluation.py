from fastapi import APIRouter
from app.schemas.contract import EvaluationMetricsResponse
from app.services.evaluation_service import EvaluationService

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


@router.get("/metrics", response_model=EvaluationMetricsResponse)
def get_evaluation_metrics():
    """
    Returns performance metrics evaluated against the ground-truth benchmark dataset
    for academic IDP defense and demonstration.
    """
    metrics = EvaluationService.evaluate_prototype()
    return metrics

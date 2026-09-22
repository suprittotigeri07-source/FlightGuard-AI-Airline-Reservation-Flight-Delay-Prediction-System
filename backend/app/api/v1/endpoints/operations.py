from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.dependencies import get_current_user, RoleChecker
from app.models.user import User
from app.schemas.operations import OperationsSummary, HighRiskFlightItem
from app.repositories.operations_repository import OperationsRepository

router = APIRouter()

allow_operations_access = RoleChecker(["OPERATIONS_AGENT", "ADMIN"])


@router.get(
    "/summary",
    response_model=OperationsSummary,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_operations_access)]
)
def get_operations_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns high-level KPI operational statistics including active flight count,
    high-risk flight count, average delay probability, and impacted passenger manifest counts.
    Requires OPERATIONS_AGENT or ADMIN role.
    """
    return OperationsRepository.get_operations_summary(db)


@router.get(
    "/high-risk-flights",
    response_model=List[HighRiskFlightItem],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(allow_operations_access)]
)
def get_high_risk_flights(
    risk_level: Optional[str] = Query(None, description="Filter by risk level: LOW, MEDIUM, HIGH, CRITICAL"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns detailed manifests for flights flagged with elevated delay risks,
    including impacted passenger counts and model delay probabilities.
    Requires OPERATIONS_AGENT or ADMIN role.
    """
    return OperationsRepository.get_high_risk_flights(db, risk_filter=risk_level)

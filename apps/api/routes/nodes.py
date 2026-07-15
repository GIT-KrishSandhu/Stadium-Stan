from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.digital_twin import OperationalContextResponse, RiskTrend, OccupancyPoint, ResourceAvailability
from models import StadiumNode

router = APIRouter(prefix="/nodes", tags=["nodes"])

@router.get("/{id}/operational-context", response_model=OperationalContextResponse)
def get_operational_context(id: str, db: Session = Depends(get_db)):
    node = db.query(StadiumNode).filter(StadiumNode.id == id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    # Mock dynamic data for demonstration
    # In a real system, this would query TelemetryEvents, RiskEngine, and Staff tracking.
    
    current_occupancy = 812
    historical_occupancy = [
        OccupancyPoint(t=-5, value=603),
        OccupancyPoint(t=0, value=812)
    ]
    occupancy_forecast = [
        OccupancyPoint(t=5, value=941)
    ]
    
    resources = [
        ResourceAvailability(type="Volunteers", available=12, assigned=4, estimated_arrival=0),
        ResourceAvailability(type="Security", available=2, assigned=0, estimated_arrival=0),
        ResourceAvailability(type="Medical", available=1, assigned=1, estimated_arrival=5)
    ]
    
    return OperationalContextResponse(
        current_occupancy=current_occupancy,
        occupancy_history=historical_occupancy,
        occupancy_forecast=occupancy_forecast,
        current_risk=0.85,
        risk_trend=RiskTrend.INCREASING,
        incidents=[],
        resources=resources,
        metadata={"name": node.name, "type": node.node_type},
        accessibility=True
    )

from models import ResponseAction

@router.get("/{id}/recommendations")
def get_recommendations(id: str, db: Session = Depends(get_db)):
    # Fetch active and historical recommendations for the node
    recommendations = db.query(ResponseAction).filter(ResponseAction.node_id == id).order_by(ResponseAction.simulation_timestamp.desc()).all()
    # In a real app, we'd serialize this properly to a DecisionObjectResponse
    # For now, we return the DB objects directly which FastAPI will serialize
    return recommendations
